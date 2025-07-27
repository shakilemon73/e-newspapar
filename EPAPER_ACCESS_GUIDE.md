# E-Paper Access and Publishing Guide

## How to Access Generated E-Papers

### 1. After Generation
When you successfully generate an E-Paper, you'll see a success message. The PDF is automatically saved to your database and file system.

### 2. Download Generated PDFs
**In the "Manage E-Papers" tab:**
- Each E-Paper row shows a **"PDF"** button if a PDF URL exists
- Click the PDF button to download or view the generated PDF
- PDFs open in a new browser tab for easy viewing

### 3. Publishing E-Papers

#### Publishing Process:
1. **Generate or Create** - Use either "Auto Generate" or "Manual Create" tabs
2. **Review** - Check the generated E-Paper in the "Manage E-Papers" tab  
3. **Publish** - Click the **"Publish"** button to make it visible to website visitors
4. **Set as Latest** - Click **"Set as Latest"** to feature it on the homepage

#### Publishing Status:
- **Published** (Green Badge) - Visible to all website visitors
- **Unpublished** (No Badge) - Only visible to admins
- **Latest** (Star Badge) - Featured on the homepage

### 4. Publishing Controls

#### Available Actions:
- **📥 PDF** - Download/view the generated PDF
- **⭐ Set as Latest** - Feature this E-Paper on the homepage
- **🟢 Publish** - Make visible to all visitors (Green button)
- **🔴 Unpublish** - Hide from visitors (Red button) 
- **✏️ Edit** - Modify title, dates, or URLs
- **🗑️ Delete** - Permanently remove the E-Paper

### 5. File Storage Locations

#### Generated PDFs are stored in:
- **Database**: E-Paper metadata in `epapers` table
- **File System**: PDF files in `public/generated-epapers/` folder
- **URLs**: Accessible via `/generated-epapers/filename.pdf`

### 6. Auto-Generation Workflow

1. **Configure Settings** - Set title, date, layout, and article count
2. **Preview Articles** - Click "Preview Articles" to see content selection
3. **Generate** - Click "Generate E-Paper" to create PDF
4. **Success Message** - Confirms PDF generation and database save
5. **Access** - Go to "Manage E-Papers" tab to download and publish

### 7. Manual Creation Workflow

1. **Enter Details** - Title, date, PDF URL, and image URL
2. **Set Options** - Choose "Set as latest" and "Publish immediately"
3. **Submit** - Click "Create E-Paper" to save
4. **Manage** - Use "Manage E-Papers" tab for further actions

## Publishing Best Practices

1. **Test First** - Always download and review the PDF before publishing
2. **Set Latest** - Only one E-Paper should be "Latest" at a time
3. **Regular Updates** - Generate new E-Papers regularly for fresh content
4. **Quality Check** - Ensure all links and content are working properly

## Troubleshooting

### Common Issues:
- **No PDF Button** - PDF URL might be missing or invalid
- **Download Fails** - Check if PDF file exists in the storage location
- **Publish Not Working** - Ensure you have admin permissions

### Support:
- Check browser console for error messages
- Verify database connectivity
- Ensure proper file permissions for the generated-epapers folder