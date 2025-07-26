// E-Paper API Routes
// Handles auto-generation of newspaper PDFs and saving to database

import { Router } from 'express';
import { generateEPaperPDF } from './epaper-generator';
import { adminSupabase } from './supabase';
import { supabase } from '../client/src/lib/supabase';

const router = Router();

// Generate new e-paper PDF and save to database
router.post('/generate', async (req, res) => {
  try {
    const { date, title, autoSave = true } = req.body;
    
    console.log('🚀 Starting e-paper generation...');
    
    // Generate PDF
    const pdfBytes = await generateEPaperPDF(date);
    
    if (autoSave) {
      // Save to database and storage
      const savedEPaper = await saveEPaperToDatabase(pdfBytes, title, date);
      
      res.json({
        success: true,
        message: 'E-paper generated and saved successfully',
        epaper: savedEPaper,
        downloadUrl: `/api/epaper/download/${savedEPaper.id}`
      });
    } else {
      // Return PDF directly
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="epaper-${date || 'today'}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    }
    
  } catch (error) {
    console.error('Error generating e-paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate e-paper',
      error: error.message
    });
  }
});

// Generate e-paper for specific date range
router.post('/generate-batch', async (req, res) => {
  try {
    const { startDate, endDate, autoSave = true } = req.body;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const results = [];
    
    // Generate e-paper for each date
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      
      try {
        const pdfBytes = await generateEPaperPDF(dateString);
        
        if (autoSave) {
          const savedEPaper = await saveEPaperToDatabase(
            pdfBytes, 
            `Bengali News - ${dateString}`, 
            dateString
          );
          results.push(savedEPaper);
        }
        
      } catch (error) {
        console.error(`Error generating e-paper for ${dateString}:`, error);
        results.push({ date: dateString, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Generated ${results.length} e-papers`,
      results
    });
    
  } catch (error) {
    console.error('Error in batch generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate e-papers',
      error: error.message
    });
  }
});

// Download e-paper PDF by ID
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get e-paper from database
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
    
    // Redirect to PDF URL or fetch from storage
    if (epaper.pdf_url) {
      res.redirect(epaper.pdf_url);
    } else {
      res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }
    
  } catch (error) {
    console.error('Error downloading e-paper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download e-paper',
      error: error.message
    });
  }
});

// Get e-paper generation history
router.get('/history', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data: epapers, error, count } = await supabase
      .from('epapers')
      .select('*', { count: 'exact' })
      .order('publish_date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);
    
    if (error) throw error;
    
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
    console.error('Error fetching e-paper history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch e-paper history',
      error: error.message
    });
  }
});

// Auto-generate today's e-paper (scheduled endpoint)
router.post('/auto-generate', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's e-paper already exists
    const { data: existingEPaper } = await supabase
      .from('epapers')
      .select('id')
      .eq('publish_date', today)
      .single();
    
    if (existingEPaper) {
      return res.json({
        success: true,
        message: 'Today\'s e-paper already exists',
        epaper: existingEPaper
      });
    }
    
    // Generate new e-paper
    const pdfBytes = await generateEPaperPDF(today);
    const savedEPaper = await saveEPaperToDatabase(
      pdfBytes, 
      `Bengali News - ${new Date().toLocaleDateString('bn-BD')}`, 
      today
    );
    
    res.json({
      success: true,
      message: 'Today\'s e-paper generated successfully',
      epaper: savedEPaper
    });
    
  } catch (error) {
    console.error('Error in auto-generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to auto-generate e-paper',
      error: error.message
    });
  }
});

// Preview e-paper without saving
router.post('/preview', async (req, res) => {
  try {
    const { date } = req.body;
    
    // Generate PDF without saving
    const pdfBytes = await generateEPaperPDF(date);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="epaper-preview.pdf"');
    res.send(Buffer.from(pdfBytes));
    
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    });
  }
});

// Helper function to save e-paper to database and storage
async function saveEPaperToDatabase(pdfBytes: Uint8Array, title: string, date?: string): Promise<any> {
  try {
    const publishDate = date || new Date().toISOString().split('T')[0];
    const fileName = `epaper-${publishDate}-${Date.now()}.pdf`;
    
    // Upload PDF to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('epapers')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to upload PDF to storage');
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('epapers')
      .getPublicUrl(fileName);
    
    // Generate thumbnail URL (same as PDF for now, can be enhanced)
    const thumbnailUrl = urlData.publicUrl;
    
    // Save to database
    const { data: epaper, error: dbError } = await adminSupabase
      .from('epapers')
      .insert({
        title,
        publish_date: publishDate,
        pdf_url: urlData.publicUrl,
        image_url: thumbnailUrl,
        is_latest: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database insert error:', dbError);
      throw new Error('Failed to save e-paper to database');
    }
    
    // Update other e-papers to not be latest
    await adminSupabase
      .from('epapers')
      .update({ is_latest: false })
      .neq('id', epaper.id);
    
    return epaper;
    
  } catch (error) {
    console.error('Error saving e-paper:', error);
    throw error;
  }
}

export default router;