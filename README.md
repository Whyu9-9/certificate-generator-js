# 🎓 Certificate Generator

A simple, modern web application for generating personalized certificates from a PDF template and a list of names.

## ✨ Features

-   **PDF Template Upload**: Upload your certificate template in PDF format
-   **CSV Names List**: Upload a CSV file containing the list of names
-   **Real-time Preview**: See how the certificate will look with different names
-   **Customizable Positioning**: Adjust font size and text position
-   **Batch Generation**: Generate certificates for multiple names at once
-   **Automatic Download**: Download as individual PDF or ZIP file for multiple certificates
-   **Drag & Drop**: Easy file upload with drag and drop support
-   **Responsive Design**: Works on desktop and mobile devices

## 🚀 How to Use

### 1. Prepare Your Files

#### PDF Template

-   Create your certificate template in any design software (Adobe Illustrator, Canva, etc.)
-   Export as PDF
-   Make sure there's space where you want the names to appear

#### CSV File

-   Create a CSV file with your list of names
-   First row should contain column headers
-   Example format:

```csv
Name,Email,Department
John Doe,john@example.com,Engineering
Jane Smith,jane@example.com,Marketing
```

### 2. Generate Certificates

1. **Open the Application**

    - Open `index.html` in your web browser
    - No server required - works offline!

2. **Upload PDF Template**

    - Click on the "Certificate Template" upload area
    - Select your PDF template file
    - Or drag and drop the file

3. **Upload CSV File**

    - Click on the "Names List" upload area
    - Select your CSV file with names
    - Or drag and drop the file

4. **Configure Settings**

    - Select the column containing names from the dropdown
    - Adjust font size using the slider (12-72px)
    - Set X and Y position for text placement
    - Use the preview to see how it looks

5. **Preview**

    - Type a name in the preview field to see how it will appear
    - Click "Update Preview" to refresh the preview
    - Adjust settings until the positioning looks correct

6. **Generate**
    - Click "Generate Certificates" button
    - Wait for the process to complete
    - Certificates will be downloaded automatically

## 📁 File Structure

```
generator-sertifikat/
├── index.html          # Main application file
├── styles.css          # Styling and layout
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🛠️ Technical Details

### Dependencies

The application uses the following external libraries (loaded via CDN):

-   **PDF-lib**: For PDF manipulation and text addition
-   **JSZip**: For creating ZIP files when generating multiple certificates
-   **FileSaver.js**: For handling file downloads

### Browser Compatibility

-   Chrome 60+
-   Firefox 55+
-   Safari 12+
-   Edge 79+

### File Size Limits

-   PDF files: Up to 10MB
-   CSV files: Up to 5MB
-   Recommended: Keep files under 2MB for best performance

## 🎨 Customization

### Styling

You can customize the appearance by modifying `styles.css`:

-   Change colors in the CSS variables
-   Modify the gradient background
-   Adjust spacing and layout

### Functionality

Modify `script.js` to:

-   Add more text fields (date, course name, etc.)
-   Change font styles
-   Add watermarks or logos
-   Implement different output formats

## 🔧 Troubleshooting

### Common Issues

**"Error loading PDF file"**

-   Make sure the PDF file is not corrupted
-   Try a different PDF file
-   Check if the file is password protected

**"Error loading CSV file"**

-   Ensure the CSV file is properly formatted
-   Check that the first row contains headers
-   Make sure there are no special characters in the file

**Preview not showing correctly**

-   Adjust the X and Y position values
-   Try different font sizes
-   Make sure the PDF template has enough space for text

**Slow generation**

-   Reduce the number of names in the CSV file
-   Use smaller PDF files
-   Close other browser tabs to free up memory

### Performance Tips

-   Use optimized PDF files (compress if possible)
-   Keep CSV files under 1000 rows for best performance
-   Use modern browsers for better performance

## 📝 Example Usage

1. **Event Certificates**: Generate certificates for workshop participants
2. **Course Completion**: Create certificates for online course graduates
3. **Awards**: Generate award certificates for employees or students
4. **Membership**: Create membership certificates for organizations

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Ensure you're using a supported browser
3. Try with smaller files first
4. Check the browser console for error messages

---

**Happy Certificate Generating! 🎉**
# certificate-generator-js
