// assets/js/load_results.js

document.addEventListener('DOMContentLoaded', function() {
    const ITEMS_PER_PAGE = 8; // Number of rows per page
    let currentPage = 1;
    let totalPages = 1;
    let data = [];

    // Define environment maps
    const environmentMaps = [
        {
            name: 'Sky',
            file: './assets/data/snow_field_puresky_1k.hdr',
        },
        {
            name: 'Ballroom',
            file: './assets/data/ballroom_1k.hdr',
        },
        {
            name: 'Streetlight',
            file: './assets/data/cobblestone_street_night_1k.hdr',
        },
        {
            name: 'Studio',
            file: './assets/data/studio_small_08_1k.hdr',
        },
        {
            name: 'Garden',
            file: './assets/data/symmetrical_garden_02_1k.hdr',
        },
    ];

    // Fetch the JSON data
    fetch('./assets/data/example_list.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
            setupPaginationControls();
            displayPage(currentPage);
        })
        .catch(error => console.error('Error loading JSON data:', error));

    function displayPage(page) {
        const tupleContainer = document.querySelector('.tuple-container');
        tupleContainer.innerHTML = ''; // Clear existing content

        // Calculate start and end indices
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, data.length);

        // Loop through the data for the current page
        for (let i = startIndex; i < endIndex; i++) {
            const item = data[i];

            // Create the tuple div
            const tuple = document.createElement('div');
            tuple.classList.add('tuple');

            // Create the image item
            const imgItem = document.createElement('div');
            imgItem.classList.add('tuple-item');
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = 'Input ' + (i + 1);
            imgItem.appendChild(img);

            // Create the gif item
            const gifItem = document.createElement('div');
            gifItem.classList.add('tuple-item');
            const gif = document.createElement('img');
            gif.src = item.gif;
            gif.alt = 'Output ' + (i + 1);
            gifItem.appendChild(gif);

            // Create the model-viewer item
            const modelItem = document.createElement('div');
            modelItem.classList.add('tuple-item');

            const modelViewer = document.createElement('model-viewer');
            modelViewer.setAttribute('id', 'model' + (i + 1));
            modelViewer.setAttribute('shadow-intensity', '1');
            // Set default environment map
            modelViewer.setAttribute('environment-image', environmentMaps[0].file);
            modelViewer.setAttribute('skybox-image', environmentMaps[0].file);
            modelViewer.setAttribute('orientation', '0deg 270deg 180deg');
            modelViewer.setAttribute('min-field-of-view', '40deg');
            modelViewer.setAttribute('max-field-of-view', '100deg');
            modelViewer.setAttribute('style', 'background: linear-gradient(#fcfaff, #fafcff); overflow-x: hidden;');
            modelViewer.setAttribute('camera-controls', '');
            modelViewer.setAttribute('touch-action', 'pan-y');

            modelItem.appendChild(modelViewer);

            // Remove the 'Model' label (deleted the code adding modelLabel)

            // Create the load model button
            const loadButton = document.createElement('button');
            loadButton.classList.add('load-model');
            loadButton.setAttribute('data-model-src', item.model);
            loadButton.textContent = '3D';
            modelItem.appendChild(loadButton);

            // Append items to tuple
            tuple.appendChild(imgItem);
            tuple.appendChild(gifItem);
            tuple.appendChild(modelItem);

            // Append tuple to container
            tupleContainer.appendChild(tuple);
        }

        // Add event listeners to the load model buttons
        document.querySelectorAll('.load-model').forEach(button => {
            button.addEventListener('click', function() {
                const modelSrc = this.getAttribute('data-model-src');
                const modelItem = this.parentElement;
                const modelViewer = modelItem.querySelector('model-viewer');
                modelViewer.setAttribute('src', modelSrc);

                // Hide the load button
                this.style.display = 'none';

                // Create and add the environment map selector
                const envSelector = document.createElement('select');
                envSelector.classList.add('env-selector');

                // Populate the dropdown with environment maps
                environmentMaps.forEach((envMap) => {
                    const option = document.createElement('option');
                    option.value = envMap.file;
                    option.textContent = envMap.name;
                    envSelector.appendChild(option);
                });

                // Set initial value
                envSelector.value = environmentMaps[0].file;

                // Add event listener for changing environment maps
                envSelector.addEventListener('change', function() {
                    const selectedEnvMap = this.value;
                    modelViewer.setAttribute('environment-image', selectedEnvMap);
                    modelViewer.setAttribute('skybox-image', selectedEnvMap);
                });

                // Insert the selector right below the model-viewer
                modelItem.insertBefore(envSelector, modelViewer.nextSibling);
            });
        });

        updatePaginationControls();
    }

    function setupPaginationControls() {
        const paginationContainer = document.querySelector('.pagination-container');

        // Create Previous button
        const prevButton = document.createElement('button');
        prevButton.classList.add('pagination-button');
        prevButton.id = 'prev-button';
        prevButton.textContent = 'Previous';
        prevButton.disabled = true; // Initially disabled
        paginationContainer.appendChild(prevButton);

        // Create Page Indicator
        const pageIndicator = document.createElement('span');
        pageIndicator.id = 'page-indicator';
        pageIndicator.textContent = ` Page ${currentPage} of ${totalPages} `;
        paginationContainer.appendChild(pageIndicator);

        // Create Next button
        const nextButton = document.createElement('button');
        nextButton.classList.add('pagination-button');
        nextButton.id = 'next-button';
        nextButton.textContent = 'Next';
        paginationContainer.appendChild(nextButton);

        // Add event listeners
        prevButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
            }
        });

        nextButton.addEventListener('click', function() {
            if (currentPage < totalPages) {
                currentPage++;
                displayPage(currentPage);
            }
        });
    }

    function updatePaginationControls() {
        const prevButton = document.getElementById('prev-button');
        const nextButton = document.getElementById('next-button');
        // Update page indicator text
        const pageIndicator = document.getElementById('page-indicator');
        pageIndicator.textContent = ` Page ${currentPage} of ${totalPages} `;

        // Update Previous button state
        prevButton.disabled = currentPage === 1;

        // Update Next button state
        nextButton.disabled = currentPage === totalPages;
    }
});
