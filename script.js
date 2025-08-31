// Global variables
let pdfTemplate = null;
let csvData = null;
let names = [];
let pdfDoc = null;
let pdfPages = null;
let originalPdfDimensions = null;

// DOM elements
const pdfFileInput = document.getElementById('pdfFile');
const csvFileInput = document.getElementById('csvFile');
const pdfUpload = document.getElementById('pdfUpload');
const csvUpload = document.getElementById('csvUpload');
const pdfPreview = document.getElementById('pdfPreview');
const csvPreview = document.getElementById('csvPreview');
const pdfFileName = document.getElementById('pdfFileName');
const csvFileName = document.getElementById('csvFileName');
const nameCount = document.getElementById('nameCount');
const nameColumn = document.getElementById('nameColumn');
const fontSize = document.getElementById('fontSize');
const xPosition = document.getElementById('xPosition');
const yPosition = document.getElementById('yPosition');
const fontSizeValue = document.getElementById('fontSizeValue');
const xPositionValue = document.getElementById('xPositionValue');
const yPositionValue = document.getElementById('yPositionValue');
const previewCanvas = document.getElementById('previewCanvas');
const previewName = document.getElementById('previewName');
const updatePreviewBtn = document.getElementById('updatePreview');
const generateBtn = document.getElementById('generateBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const downloadSampleCsvBtn = document.getElementById('downloadSampleCsv');
const requirementsCheck = document.getElementById('requirementsCheck');
const coordinateInfo = document.getElementById('coordinateInfo');
const currentX = document.getElementById('currentX');
const currentY = document.getElementById('currentY');
const syncPreviewNameBtn = document.getElementById('syncPreviewName');

// Set PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    updatePreview();
    checkGenerateButton();
});

function setupEventListeners() {
    // PDF file upload
    pdfUpload.addEventListener('click', () => pdfFileInput.click());
    pdfFileInput.addEventListener('change', handlePdfUpload);
    setupDragAndDrop(pdfUpload, pdfFileInput, handlePdfUpload);

    // CSV file upload
    csvUpload.addEventListener('click', () => csvFileInput.click());
    csvFileInput.addEventListener('change', handleCsvUpload);
    setupDragAndDrop(csvUpload, csvFileInput, handleCsvUpload);

    // Settings controls
    fontSize.addEventListener('input', updateSettings);
    xPosition.addEventListener('input', updateSettings);
    yPosition.addEventListener('input', updateSettings);
    nameColumn.addEventListener('change', updateNamesList);

    // Preview controls
    updatePreviewBtn.addEventListener('click', () => updatePreview());
    previewName.addEventListener('input', () => updatePreview());

    // Preview canvas click to set position
    previewCanvas.addEventListener('click', handlePreviewClick);

    // Generate button
    generateBtn.addEventListener('click', generateCertificates);

    // Download sample CSV button
    downloadSampleCsvBtn.addEventListener('click', downloadSampleCsv);

    // Sync preview name button
    syncPreviewNameBtn.addEventListener('click', syncPreviewWithFirstName);
}

function setupDragAndDrop(uploadElement, fileInput, handler) {
    uploadElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadElement.classList.add('dragover');
    });

    uploadElement.addEventListener('dragleave', () => {
        uploadElement.classList.remove('dragover');
    });

    uploadElement.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadElement.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handler();
        }
    });
}

async function handlePdfUpload() {
    const file = pdfFileInput.files[0];
    if (!file) return;

    try {
        pdfTemplate = file;
        pdfFileName.textContent = file.name;
        pdfPreview.style.display = 'block';

        // Load PDF for preview and get dimensions
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        pdfPages = pdfDoc.getPages();

        // Store original PDF dimensions
        const firstPage = pdfPages[0];
        const { width, height } = firstPage.getSize();
        originalPdfDimensions = { width, height };

        console.log('PDF dimensions:', originalPdfDimensions);

        // Update preview with the actual PDF
        await updatePreview();
        checkGenerateButton();
    } catch (error) {
        alert('Error loading PDF file: ' + error.message);
    }
}

async function handleCsvUpload() {
    const file = csvFileInput.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        csvData = parseCSV(text);

        csvFileName.textContent = file.name;
        csvPreview.style.display = 'block';

        // Populate column selector
        populateColumnSelector();

        updateNamesList();
        checkGenerateButton();
    } catch (error) {
        alert('Error loading CSV file: ' + error.message);
    }
}

function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    console.log('CSV Headers:', headers);

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }

    console.log('CSV Data (first 3 rows):', data.slice(0, 3));

    return { headers, data };
}

function populateColumnSelector() {
    nameColumn.innerHTML = '<option value="">Select column...</option>';
    csvData.headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        nameColumn.appendChild(option);
    });
}

function updateNamesList() {
    const selectedColumn = nameColumn.value;
    if (!selectedColumn || !csvData) {
        names = [];
        nameCount.textContent = '0';
        checkGenerateButton();
        return;
    }

    names = csvData.data
        .map(row => row[selectedColumn])
        .filter(name => name && name.trim());

    nameCount.textContent = names.length;

    // Update preview name to show the first actual name from CSV
    if (names.length > 0) {
        previewName.value = names[0];
        console.log(`Updated preview name to: "${names[0]}" from CSV column "${selectedColumn}"`);
    }

    updatePreview();
    checkGenerateButton();
}

function updateSettings() {
    fontSizeValue.textContent = fontSize.value;
    xPositionValue.textContent = xPosition.value;
    yPositionValue.textContent = yPosition.value;
    currentX.textContent = xPosition.value;
    currentY.textContent = yPosition.value;
    updatePreview();
}

async function updatePreview() {
    if (!pdfTemplate || !originalPdfDimensions) {
        clearCanvas();
        return;
    }

    try {
        // Show loading state
        const ctx = previewCanvas.getContext('2d');
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading preview...', previewCanvas.width / 2, previewCanvas.height / 2);

        // Load PDF using PDF.js
        const arrayBuffer = await pdfTemplate.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Calculate scale to fit canvas (maintain aspect ratio)
        const canvasWidth = 800;
        const canvasHeight = 600;
        const scale = Math.min(canvasWidth / originalPdfDimensions.width, canvasHeight / originalPdfDimensions.height);

        // Set canvas size to match scaled PDF
        const scaledWidth = originalPdfDimensions.width * scale;
        const scaledHeight = originalPdfDimensions.height * scale;
        previewCanvas.width = scaledWidth;
        previewCanvas.height = scaledHeight;

        // Render PDF page to canvas
        const viewport = page.getViewport({ scale });
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // Draw name preview to match PDF-lib exactly
        const name = previewName.value || 'John Doe';
        console.log(`Preview showing name: "${name}"`);

        // Get coordinates from sliders (these are in PDF-lib coordinate system)
        const pdfX = parseFloat(xPosition.value);
        const pdfY = parseFloat(yPosition.value);

        // Convert PDF-lib coordinates to canvas coordinates with automatic adjustment
        // Based on your images: preview text appears more to the right than PDF text, so we need to move preview left
        const automaticXAdjustment = fontSize.value * scale * 2.5; // Move preview text right
        const automaticYAdjustment = 0; // No Y adjustment needed based on your images

        const canvasX = pdfX * scale + automaticXAdjustment;
        const canvasY = scaledHeight - (pdfY * scale) + automaticYAdjustment;

        console.log(`PDF coordinates: (${pdfX}, ${pdfY})`);
        console.log(`Canvas coordinates: (${canvasX}, ${canvasY})`);
        console.log(`Automatic adjustments: X=${automaticXAdjustment}, Y=${automaticYAdjustment}`);
        console.log(`Scale: ${scale}`);

        // Set font properties to match PDF-lib
        const previewFontSize = fontSize.value * scale;
        ctx.font = `${previewFontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // White outline for visibility
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeText(name, canvasX, canvasY);

        // Black text
        ctx.fillStyle = '#000';
        ctx.fillText(name, canvasX, canvasY);

        // Store scale for coordinate conversion
        window.previewScale = scale;

    } catch (error) {
        console.error('Error updating preview:', error);
        clearCanvas();
        // Show error message
        const ctx = previewCanvas.getContext('2d');
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.fillStyle = '#dc3545';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Error loading preview', previewCanvas.width / 2, previewCanvas.height / 2 - 10);
        ctx.fillText('Please check your PDF file', previewCanvas.width / 2, previewCanvas.height / 2 + 10);
    }
}

function clearCanvas() {
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function checkGenerateButton() {
    const hasPdf = pdfTemplate && pdfDoc;
    const hasCsv = csvData !== null;
    const hasColumnSelected = nameColumn.value !== '';
    const hasNames = names.length > 0;

    console.log('Debug generate button:', {
        hasPdf: !!hasPdf,
        hasCsv: !!hasCsv,
        hasNames: hasNames,
        namesCount: names.length,
        hasColumnSelected: hasColumnSelected,
        selectedColumn: nameColumn.value
    });

    // Update requirements check display
    const requirements = requirementsCheck.querySelectorAll('p');

    requirements[0].textContent = hasPdf ? '✅ PDF Template uploaded' : '❌ PDF Template uploaded';
    requirements[0].className = hasPdf ? 'checked' : 'unchecked';

    requirements[1].textContent = hasCsv ? '✅ CSV file uploaded' : '❌ CSV file uploaded';
    requirements[1].className = hasCsv ? 'checked' : 'unchecked';

    requirements[2].textContent = hasColumnSelected ? '✅ Name column selected' : '❌ Name column selected';
    requirements[2].className = hasColumnSelected ? 'checked' : 'unchecked';

    requirements[3].textContent = hasNames ? `✅ Names found in CSV (${names.length})` : '❌ Names found in CSV';
    requirements[3].className = hasNames ? 'checked' : 'unchecked';

    generateBtn.disabled = !(hasPdf && hasCsv && hasColumnSelected && hasNames);
}

async function generateCertificates() {
    if (!pdfTemplate || !names.length) {
        alert('Please upload both PDF template and CSV file with names.');
        return;
    }

    try {
        generateBtn.disabled = true;
        progressContainer.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Generating certificates...';

        const zip = new JSZip();
        const totalNames = names.length;

        console.log('Starting generation with names:', names);
        console.log('Current preview name:', previewName.value);

        for (let i = 0; i < totalNames; i++) {
            const name = names[i];
            console.log(`Generating certificate for: "${name}"`);
            progressText.textContent = `Generating certificate for ${name}... (${i + 1}/${totalNames})`;

            // Create certificate for this name
            const certificatePdf = await createCertificate(name);

            // Add to zip
            const fileName = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_certificate.pdf`;
            zip.file(fileName, certificatePdf);

            // Update progress
            const progress = ((i + 1) / totalNames) * 100;
            progressFill.style.width = `${progress}%`;

            // Small delay to prevent browser freezing
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        progressText.textContent = 'Creating download...';

        // Generate zip file
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Download
        if (totalNames === 1) {
            // Single file - download directly as PDF
            const certificatePdf = await createCertificate(names[0]);
            const fileName = `${names[0].replace(/[^a-zA-Z0-9]/g, '_')}_certificate.pdf`;
            const blob = new Blob([certificatePdf], { type: 'application/pdf' });
            saveAs(blob, fileName);
        } else {
            // Multiple files - download as zip
            saveAs(zipBlob, 'certificates.zip');
        }

        progressText.textContent = 'Certificates generated successfully!';
        setTimeout(() => {
            progressContainer.style.display = 'none';
            generateBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Error generating certificates:', error);
        alert('Error generating certificates: ' + error.message);
        progressContainer.style.display = 'none';
        generateBtn.disabled = false;
    }
}

async function createCertificate(name) {
    try {
        // Create a new PDF document from template
        const newPdfDoc = await PDFLib.PDFDocument.load(await pdfTemplate.arrayBuffer());

        // Get the first page
        const page = newPdfDoc.getPage(0);
        const { width, height } = page.getSize();

        console.log(`Creating certificate for "${name}"`);
        console.log(`PDF page dimensions: ${width} x ${height}`);
        console.log(`Using coordinates: x=${xPosition.value}, y=${yPosition.value}`);

        // Use coordinates directly from sliders - they're already in PDF-lib coordinate system
        const x = parseFloat(xPosition.value);
        const y = parseFloat(yPosition.value);

        // Add text to the page using PDF-lib coordinate system (bottom-left origin)
        const helveticaFont = await newPdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        page.drawText(name, {
            x: x,
            y: y, // Use Y coordinate directly (PDF-lib bottom-left origin)
            size: parseFloat(fontSize.value),
            font: helveticaFont,
            color: PDFLib.rgb(0, 0, 0),
        });

        console.log(`Added text "${name}" at position (${x}, ${y}) with font size ${fontSize.value}`);

        // Save the PDF
        return await newPdfDoc.save();
    } catch (error) {
        console.error('Error creating certificate:', error);
        throw error;
    }
}

// Sync preview name with first name from CSV
function syncPreviewWithFirstName() {
    if (names.length > 0) {
        previewName.value = names[0];
        console.log(`Manually synced preview name to: "${names[0]}"`);
        updatePreview();
    } else {
        alert('No names found in CSV. Please upload a CSV file and select a name column.');
    }
}

// Handle preview canvas click
function handlePreviewClick(event) {
    if (!pdfTemplate || !originalPdfDimensions || !window.previewScale) return;

    const rect = previewCanvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    console.log(`Canvas click at: (${canvasX}, ${canvasY})`);

    // Convert canvas coordinates to PDF-lib coordinates
    const scale = window.previewScale;
    const pdfX = canvasX / scale;
    const pdfY = originalPdfDimensions.height - (canvasY / scale); // Convert from canvas (top-left) to PDF-lib (bottom-left)

    console.log(`Converted to PDF coordinates: (${pdfX}, ${pdfY})`);
    console.log(`Scale used: ${scale}`);

    // Update sliders with PDF-lib coordinates
    xPosition.value = Math.round(pdfX);
    yPosition.value = Math.round(pdfY);

    // Update display
    xPositionValue.textContent = Math.round(pdfX);
    yPositionValue.textContent = Math.round(pdfY);
    currentX.textContent = Math.round(pdfX);
    currentY.textContent = Math.round(pdfY);

    // Update preview
    updatePreview();
}

// Download sample CSV function
function downloadSampleCsv() {
    const sampleCsvContent = `Name,Email,Department,Position
John Doe,john.doe@example.com,Engineering,Software Engineer
Jane Smith,jane.smith@example.com,Marketing,Marketing Manager
Michael Johnson,michael.johnson@example.com,Sales,Sales Representative
Sarah Wilson,sarah.wilson@example.com,HR,HR Specialist
David Brown,david.brown@example.com,Finance,Financial Analyst
Lisa Davis,lisa.davis@example.com,Operations,Operations Manager
Robert Miller,robert.miller@example.com,IT,IT Administrator
Emily Garcia,emily.garcia@example.com,Design,UI/UX Designer
James Rodriguez,james.rodriguez@example.com,Engineering,DevOps Engineer
Maria Martinez,maria.martinez@example.com,Marketing,Content Creator`;

    const blob = new Blob([sampleCsvContent], { type: 'text/csv' });
    saveAs(blob, 'sample_names.csv');
}

// Utility function to show notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.background = '#28a745';
    } else if (type === 'error') {
        notification.style.background = '#dc3545';
    } else {
        notification.style.background = '#17a2b8';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);