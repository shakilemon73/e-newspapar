// Modern E-Paper Management API
// Simple file upload and management system for digital newspapers

import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../client/src/lib/supabase';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for PDF files
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed') as any, false);
    }
  }
});

// Upload new e-paper PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file provided'
      });
    }

    const { title, publish_date, description, is_latest } = req.body;

    if (!title || !publish_date) {
      return res.status(400).json({
        success: false,
        message: 'Title and publish date are required'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `epaper-${publish_date}-${timestamp}.pdf`;

    console.log('📤 Uploading e-paper PDF to storage...');

    // Upload PDF to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('epapers')
      .upload(fileName, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload PDF to storage',
        error: uploadError.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('epapers')
      .getPublicUrl(fileName);

    console.log('💾 Saving e-paper record to database...');

    // If this is marked as latest, update all others to not be latest
    if (is_latest === 'true' || is_latest === true) {
      await supabase
        .from('epapers')
        .update({ is_latest: false })
        .neq('id', 0); // Update all existing records
    }

    // Save e-paper record to database
    const { data: epaper, error: dbError } = await supabase
      .from('epapers')
      .insert({
        title,
        publish_date,
        description: description || '',
        pdf_url: urlData.publicUrl,
        image_url: urlData.publicUrl, // Use PDF URL as placeholder for thumbnail
        is_latest: is_latest === 'true' || is_latest === true,
        file_size: req.file.size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save e-paper record',
        error: dbError.message
      });
    }

    console.log('✅ E-paper uploaded successfully');

    res.json({
      success: true,
      message: 'E-paper uploaded successfully',
      epaper,
      downloadUrl: `/api/modern-epaper/download/${epaper.id}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all e-papers with pagination
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, latest_only = false } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('epapers')
      .select('*', { count: 'exact' })
      .order('publish_date', { ascending: false });

    if (latest_only === 'true') {
      query = query.eq('is_latest', true);
    }

    const { data: epapers, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch e-papers',
        error: error.message
      });
    }

    res.json({
      success: true,
      epapers: epapers || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });

  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-papers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get single e-paper by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: epaper, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found'
      });
    }

    res.json({
      success: true,
      epaper
    });

  } catch (error) {
    console.error('Get e-paper error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Download e-paper PDF
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: epaper, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found'
      });
    }

    if (!epaper.pdf_url) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    // Redirect to the PDF URL
    res.redirect(epaper.pdf_url);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update e-paper details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_latest } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_latest !== undefined) {
      updateData.is_latest = is_latest;
      
      // If setting this as latest, update others to not be latest
      if (is_latest) {
        await supabase
          .from('epapers')
          .update({ is_latest: false })
          .neq('id', id);
      }
    }

    const { data: epaper, error } = await supabase
      .from('epapers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found or update failed',
        error: error?.message
      });
    }

    res.json({
      success: true,
      message: 'E-paper updated successfully',
      epaper
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete e-paper
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get e-paper details first
    const { data: epaper, error: fetchError } = await supabase
      .from('epapers')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found'
      });
    }

    // Delete from storage if PDF URL exists
    if (epaper.pdf_url) {
      try {
        // Extract filename from URL
        const fileName = epaper.pdf_url.split('/').pop();
        if (fileName && fileName.includes('epaper-')) {
          await supabase.storage
            .from('epapers')
            .remove([fileName]);
        }
      } catch (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Continue with database deletion even if storage fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('epapers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete e-paper',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'E-paper deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get latest e-paper
router.get('/latest/current', async (req, res) => {
  try {
    const { data: epaper, error } = await supabase
      .from('epapers')
      .select('*')
      .eq('is_latest', true)
      .order('publish_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch latest e-paper',
        error: error.message
      });
    }

    if (!epaper) {
      // If no latest e-paper, get the most recent one
      const { data: recentEpaper, error: recentError } = await supabase
        .from('epapers')
        .select('*')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();

      if (recentError) {
        return res.status(404).json({
          success: false,
          message: 'No e-papers found'
        });
      }

      return res.json({
        success: true,
        epaper: recentEpaper,
        is_fallback: true
      });
    }

    res.json({
      success: true,
      epaper,
      is_fallback: false
    });

  } catch (error) {
    console.error('Latest e-paper error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest e-paper',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;