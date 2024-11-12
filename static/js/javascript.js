/*
    Application Name: IDArt 
    Course: INFO39014 Capstone Project 
    Date: November 25, 2024
    Group: 19
    Authors: Damian Dubicki, Dylan Law, Suresh Sharma, Volodymyr Suprun
*/

let cropper;

// Opens the file picker
document.getElementById('uploadButton').addEventListener('click', () => {
    document.getElementById('imageInput').click();
});

// Event listener for image input
document.getElementById('imageInput').addEventListener('change', (event) => {
    const file = event.target.files[0];

    // Check if file is of accepted type
    const acceptedTypes = ['image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
        alert('Only JPEG and PNG files are allowed.');
        return;
    }

    // Clear previous results
    resetResults();

    const reader = new FileReader();
    reader.onload = () => {
        const cropContainer = document.getElementById('cropContainer');
        document.getElementById('cropImage').src = reader.result;
        cropContainer.style.display = 'block';

        // Show the instruction text
        document.getElementById('instructionText').style.display = 'block';

        // Initialize Cropper.js
        if (cropper) {
            cropper.destroy();
        }
        cropper = new Cropper(document.getElementById('cropImage'), {
            aspectRatio: NaN,
            viewMode: 1,
            dragMode: 'none',
            autoCropArea: 0.8,
            zoomable: false,
            scalable: false,
            movable: false,
            rotatable: false,
        });
    };
    reader.readAsDataURL(file);
});

// Event listener for the crop button
document.getElementById('cropButton').addEventListener('click', () => {
    if (cropper) {
        const canvas = cropper.getCroppedCanvas();
        const selectedImage = document.getElementById('selectedImage');
        
        // Display cropped image
        selectedImage.src = canvas.toDataURL('image/jpeg');
        selectedImage.style.display = 'block';
        document.getElementById('cropContainer').style.display = 'none';

        // Hide the instruction text after cropping
        document.getElementById('instructionText').style.display = 'none';

        // Send cropped image to the backend
        canvas.toBlob((blob) => {
            uploadImage(blob);
        }, 'image/jpeg');
    }
});

// Event listener for theme button
document.getElementById('toggleThemeButton').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
});

// Function to clear the image and details
function resetResults() {
    // Clear any previously displayed image
    document.getElementById('selectedImage').src = '';
    document.getElementById('selectedImage').style.display = 'none';

    // Hide and reset previous prediction details
    document.getElementById('prediction').style.display = 'none';
    document.getElementById('artwork').textContent = '';
    document.getElementById('artist').textContent = '';
    document.getElementById('date').textContent = '';
    document.getElementById('style').textContent = '';
    document.getElementById('confidence').textContent = '';

    // Hide the crop container and instruction text
    document.getElementById('cropContainer').style.display = 'none';
    document.getElementById('instructionText').style.display = 'none';

    // Reset file input to allow re-selection of the same file
    document.getElementById('imageInput').value = '';
}

// Function to upload an image for prediction
async function uploadImage(file) {
    document.getElementById('loading').style.display = 'block';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        document.getElementById('artwork').textContent = `Artwork: ${data.artwork}`;
        document.getElementById('artist').textContent = `Artist: ${data.artist}`;
        document.getElementById('date').textContent = `Date: ${data.date}`;
        document.getElementById('style').textContent = `Style: ${data.style}`;
        document.getElementById('confidence').textContent = `Confidence: ${data.confidence}`;
        document.getElementById('prediction').style.display = 'block';

    } catch (error) {
        console.error('Error uploading image:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
