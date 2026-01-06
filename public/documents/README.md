# Ministry Documents

This folder contains official ministry documents that are accessible through the app.

## How to Add Documents

1. **Add PDF files to this folder**
   - Place your PDF files in `/public/documents/`
   - Use descriptive filenames (e.g., `financial-report-2024.pdf`)

2. **Update the documents list**
   - Open `src/screens/DocumentsScreen.tsx`
   - Add your document to the `documents` array:
   
   ```typescript
   {
     id: '3',
     title: 'Your Document Title',
     description: 'Brief description of the document',
     date: 'January 2024',
     url: '/documents/your-file-name.pdf',
     size: '1.5 MB',
     category: 'financial' // or 'policy', 'report', 'other'
   }
   ```

3. **Commit and push**
   ```bash
   git add public/documents/your-file.pdf
   git add src/screens/DocumentsScreen.tsx
   git commit -m "Add new ministry document"
   git push origin main
   ```

## Document Categories

- **financial**: Financial reports, budgets, audits
- **policy**: Policies, guidelines, procedures
- **report**: Annual reports, impact reports
- **other**: Other official documents

## Example Documents

The app comes with two example documents in the DocumentsScreen. Replace these with your actual documents.
