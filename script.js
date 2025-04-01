// Global variables
let currentData = null;
let reliabilityChart = null;

// DOM elements
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const csvUploadInput = document.getElementById('csv-upload');
    const loadCsvBtn = document.getElementById('load-csv-btn');
    const loadExampleBtn = document.getElementById('load-example-btn');
    const pasteDataArea = document.getElementById('paste-data');
    const loadPasteBtn = document.getElementById('load-paste-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const dataPreview = document.getElementById('data-preview');
    const dataDimensions = document.getElementById('data-dimensions');
    const dataTable = document.getElementById('data-table');
    const resultsSection = document.getElementById('results-section');

    // Result display elements
    const triValue = document.getElementById('tri-value');
    const alphaValue = document.getElementById('alpha-value');
    const omegaValue = document.getElementById('omega-value');
    const betweenVariance = document.getElementById('between-variance');
    const withinVariance = document.getElementById('within-variance');
    const errorRatio = document.getElementById('error-ratio');
    const systematicVariance = document.getElementById('systematic-variance');
    const errorVariance = document.getElementById('error-variance');

    // Event listeners
    if (loadCsvBtn) loadCsvBtn.addEventListener('click', handleCsvUpload);
    if (loadExampleBtn) loadExampleBtn.addEventListener('click', loadExampleData);
    if (loadPasteBtn) loadPasteBtn.addEventListener('click', handlePasteData);
    if (calculateBtn) calculateBtn.addEventListener('click', calculateIndices);

    // Handler for CSV file upload
    function handleCsvUpload() {
        const file = csvUploadInput.files[0];
        if (!file) {
            alert('Please select a CSV file');
            return;
        }

        Papa.parse(file, {
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    processUploadedData(results.data);
                } else {
                    alert('No data found in the CSV file');
                }
            },
            error: function(error) {
                alert('Error parsing CSV: ' + error.message);
            }
        });
    }

    // Handler for pasted data
    function handlePasteData() {
        const pastedData = pasteDataArea.value.trim();
        if (!pastedData) {
            alert('Please paste data in CSV format');
            return;
        }

        Papa.parse(pastedData, {
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    processUploadedData(results.data);
                } else {
                    alert('No valid data found');
                }
            },
            error: function(error) {
                alert('Error parsing data: ' + error.message);
            }
        });
    }

    // Example data
    const exampleData = [
        [3, 4, 3, 2],
        [1, 1, 2, 1],
        [5, 5, 6, 4],
        [4, 3, 4, 3],
        [2, 2, 3, 2],
        [3, 4, 4, 3],
        [4, 5, 6, 5],
        [5, 5, 4, 4],
        [2, 3, 2, 3],
        [3, 2, 3, 2]
    ];

    // Load example data
    function loadExampleData() {
        // Create a header row for the example data
        const headerRow = [];
        for (let i = 0; i < exampleData[0].length; i++) {
            headerRow.push(`Item${i+1}`);
        }
        
        const dataWithHeader = [headerRow].concat(exampleData);
        processUploadedData(dataWithHeader);
    }

    // Process uploaded or pasted data
    function processUploadedData(data) {
        // Check if data is valid
        if (!data || data.length <= 1) {
            alert('Invalid data format. Need both header row and data rows.');
            return;
        }

        // Extract header row
        const headerRow = data[0];
        
        // Convert all data rows to numeric values
        const numericData = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            // Skip empty rows
            if (row.length <= 1 && !row[0]) continue;
            
            const numericRow = [];
            for (let j = 0; j < row.length; j++) {
                // Try to convert to number
                const value = parseFloat(row[j]);
                if (!isNaN(value)) {
                    numericRow.push(value);
                } else {
                    numericRow.push(null); // Mark as missing
                }
            }
            if (numericRow.length > 0) {
                numericData.push(numericRow);
            }
        }

        // Store the processed data
        currentData = {
            headers: headerRow,
            data: numericData
        };

        // Display the data preview
        displayDataPreview();
        
        // Enable the calculate button
        calculateBtn.disabled = false;
    }

    // Display data preview in a table
    function displayDataPreview() {
        if (!currentData) return;
        
        // Show data dimensions
        const rows = currentData.data.length;
        const cols = currentData.headers.length;
        dataDimensions.textContent = `Data dimensions: ${rows} respondents × ${cols} items`;
        
        // Create table header
        let tableHTML = '<thead><tr><th>#</th>';
        for (let i = 0; i < currentData.headers.length; i++) {
            tableHTML += `<th>${currentData.headers[i]}</th>`;
        }
        tableHTML += '</tr></thead><tbody>';
        
        // Create table rows
        for (let i = 0; i < currentData.data.length; i++) {
            tableHTML += `<tr><td><strong>${i+1}</strong></td>`;
            for (let j = 0; j < currentData.data[i].length; j++) {
                const value = currentData.data[i][j];
                tableHTML += `<td>${value !== null ? value : 'NA'}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody>';
        
        // Set the table HTML
        dataTable.innerHTML = tableHTML;
        
        // Show the data preview section
        dataPreview.style.display = 'block';
    }

    // Calculate reliability indices
    function calculateIndices() {
        if (!currentData || currentData.data.length < 3) {
            alert('Not enough data to calculate reliability indices. Need at least 3 rows.');
            return;
        }

        try {
            // Calculate the three reliability indices
            const tri = calculateTRI(currentData.data);
            const alpha = calculateCronbachsAlpha(currentData.data);
            const omega = calculateMcDonaldsOmega(currentData.data);
            
            // Display the results
            displayResults(tri, alpha, omega);
            
            // Create or update the comparison chart
            createComparisonChart(tri.value, alpha, omega);
            
            // Show the results section
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error calculating indices:", error);
            alert("An error occurred during calculation. Please check your data and try again.");
        }
    }

    // Display the results
    function displayResults(tri, alpha, omega) {
        // Format values to 3 decimal places
        triValue.textContent = formatNumber(tri.value);
        alphaValue.textContent = formatNumber(alpha);
        omegaValue.textContent = formatNumber(omega);
        
        // Display TRI components
        betweenVariance.textContent = formatNumber(tri.components.betweenVariance);
        withinVariance.textContent = formatNumber(tri.components.withinVariance);
        errorRatio.textContent = formatNumber(tri.components.errorVarianceRatio);
        systematicVariance.textContent = formatNumber(tri.components.systematicVariance);
        errorVariance.textContent = formatNumber(tri.components.errorVariance);
    }

    // Create a comparison chart
    function createComparisonChart(tri, alpha, omega) {
        const ctx = document.getElementById('reliability-chart').getContext('2d');
        
        if (reliabilityChart) {
            reliabilityChart.destroy();
        }
        
        reliabilityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Total Reliability Index (TRI)', 'Cronbach\'s Alpha', 'McDonald\'s Omega'],
                datasets: [{
                    label: 'Reliability Value',
                    data: [tri, alpha, omega],
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(241, 196, 15, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(241, 196, 15, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Value: ${formatNumber(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }
});

// Calculate Total Reliability Index (TRI)
function calculateTRI(data) {
    // Number of items (columns)
    const k = data[0].length;
    
    // Need at least 2 items for calculation
    if (k <= 1) {
        return {
            value: NaN,
            error: "TRI cannot be calculated with fewer than 2 items"
        };
    }
    
    // Calculate item variances (Between-Person Variance)
    const itemVariances = [];
    for (let j = 0; j < k; j++) {
        const itemValues = data.map(row => row[j]).filter(val => val !== null);
        itemVariances.push(variance(itemValues));
    }
    
    // Calculate total variance of summed scores
    const rowSums = data.map(row => 
        row.reduce((sum, val) => (val !== null ? sum + val : sum), 0)
    );
    const totalVariance = variance(rowSums);
    
    // Calculate within-respondent variance (Within-Person Variance)
    const withinRespondentVariance = data.map(row => {
        const validValues = row.filter(val => val !== null);
        return variance(validValues);
    });
    
    // Mean values
    const meanItemVariance = mean(itemVariances);
    const meanWithinVariance = mean(withinRespondentVariance);
    
    // Error variance ratio (Systematic/Error Variance Ratio)
    const errorVarianceRatio = meanItemVariance / totalVariance;
    
    // Adjusted within-person variance
    const adjustedWithinVariance = meanWithinVariance * errorVarianceRatio;
    
    // Numerator and denominator for the TRI formula
    const numerator = sum(itemVariances) + adjustedWithinVariance;
    const denominator = totalVariance + adjustedWithinVariance;
    
    // Final TRI calculation
    let triValue = (k / (k - 1)) * (1 - numerator / denominator);
    
    // Ensure TRI is within 0-1 bounds
    triValue = Math.max(0, Math.min(1, triValue));
    
    // Calculate systematic and error variance
    const systematicVarianceValue = triValue;
    const errorVarianceValue = 1 - systematicVarianceValue;
    
    // Between-person and within-person variance proportion
    const betweenProportion = sum(itemVariances) / numerator;
    const withinProportion = adjustedWithinVariance / numerator;
    
    // Return the TRI value and components
    return {
        value: triValue,
        components: {
            betweenVariance: betweenProportion,
            withinVariance: withinProportion,
            systematicVariance: systematicVarianceValue,
            errorVariance: errorVarianceValue,
            errorVarianceRatio: errorVarianceRatio,
            itemVariances: itemVariances,
            totalVariance: totalVariance,
            meanWithinVariance: meanWithinVariance
        }
    };
}

// Calculate Cronbach's Alpha
function calculateCronbachsAlpha(data) {
    // Number of items (columns)
    const k = data[0].length;
    
    // Need at least 2 items for calculation
    if (k <= 1) {
        return NaN;
    }
    
    // Calculate item variances
    const itemVariances = [];
    for (let j = 0; j < k; j++) {
        const itemValues = data.map(row => row[j]).filter(val => val !== null);
        itemVariances.push(variance(itemValues));
    }
    
    // Calculate total variance of summed scores
    const rowSums = data.map(row => 
        row.reduce((sum, val) => (val !== null ? sum + val : sum), 0)
    );
    const totalVariance = variance(rowSums);
    
    // Calculate alpha
    const alpha = (k / (k - 1)) * (1 - (sum(itemVariances) / totalVariance));
    
    // Ensure alpha is within reasonable bounds
    return Math.max(0, Math.min(1, alpha));
}

// Calculate McDonald's Omega
function calculateMcDonaldsOmega(data) {
    // Number of items (columns)
    const k = data[0].length;
    
    // Need at least 2 items for calculation
    if (k <= 1) {
        return NaN;
    }

    try {
        // Calculate correlation matrix
        const corrMatrix = calculateCorrelationMatrix(data);
        
        // Calculate average correlation
        let sumCorr = 0;
        let count = 0;
        for (let i = 0; i < k; i++) {
            for (let j = i+1; j < k; j++) {
                sumCorr += corrMatrix[i][j];
                count++;
            }
        }
        const avgCorr = count > 0 ? sumCorr / count : 0;
        
        // Calculate McDonald's Omega using average correlation
        // This is based on the formula relating average correlation to reliability
        const omega = (k * avgCorr) / (1 + (k - 1) * avgCorr);
        
        // Ensure omega is within reasonable bounds
        return Math.max(0, Math.min(1, omega));
    } catch (error) {
        console.error("Error calculating McDonald's Omega:", error);
        // Fallback to a more robust estimation when calculation fails
        return calculateCronbachsAlpha(data);
    }
}

// Calculate correlation matrix
function calculateCorrelationMatrix(data) {
    const k = data[0].length;
    const matrix = Array(k).fill().map(() => Array(k).fill(0));
    
    for (let i = 0; i < k; i++) {
        // Get values for item i
        const itemI = data.map(row => row[i]).filter(val => val !== null);
        
        for (let j = 0; j < k; j++) {
            // Get values for item j
            const itemJ = data.map(row => row[j]).filter(val => val !== null);
            
            // Find common valid indices
            const validPairs = [];
            for (let idx = 0; idx < data.length; idx++) {
                if (data[idx][i] !== null && data[idx][j] !== null) {
                    validPairs.push({ i: data[idx][i], j: data[idx][j] });
                }
            }
            
            // Calculate correlation if there are enough valid pairs
            if (validPairs.length > 1) {
                const iValues = validPairs.map(pair => pair.i);
                const jValues = validPairs.map(pair => pair.j);
                matrix[i][j] = correlation(iValues, jValues);
            } else {
                matrix[i][j] = i === j ? 1 : 0;
            }
        }
    }
    
    return matrix;
}

// Calculate covariance matrix
function calculateCovarianceMatrix(data) {
    const k = data[0].length;
    const covMatrix = Array(k).fill().map(() => Array(k).fill(0));
    
    for (let i = 0; i < k; i++) {
        const itemI = data.map(row => row[i]).filter(val => val !== null);
        
        for (let j = i; j < k; j++) {
            const itemJ = data.map(row => row[j]).filter(val => val !== null);
            
            // Find common valid indices
            const validPairs = [];
            for (let idx = 0; idx < data.length; idx++) {
                if (data[idx][i] !== null && data[idx][j] !== null) {
                    validPairs.push({ i: data[idx][i], j: data[idx][j] });
                }
            }
            
            // Calculate covariance if enough valid pairs
            if (validPairs.length > 1) {
                const iValues = validPairs.map(pair => pair.i);
                const jValues = validPairs.map(pair => pair.j);
                const cov = covariance(iValues, jValues);
                covMatrix[i][j] = cov;
                covMatrix[j][i] = cov; // Covariance matrix is symmetric
            } else {
                covMatrix[i][j] = i === j ? variance(itemI) : 0;
                covMatrix[j][i] = covMatrix[i][j];
            }
        }
    }
    
    return covMatrix;
}

// Calculate correlation matrix from covariance matrix
function calculateCorrelationMatrixFromCov(covMatrix) {
    const k = covMatrix.length;
    const corrMatrix = Array(k).fill().map(() => Array(k).fill(0));
    
    for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
            if (i === j) {
                corrMatrix[i][j] = 1; // Diagonal elements are 1
            } else {
                // Correlation = Covariance / (SD_i * SD_j)
                const sd_i = Math.sqrt(Math.abs(covMatrix[i][i]));
                const sd_j = Math.sqrt(Math.abs(covMatrix[j][j]));
                
                if (sd_i > 0 && sd_j > 0) {
                    corrMatrix[i][j] = covMatrix[i][j] / (sd_i * sd_j);
                } else {
                    corrMatrix[i][j] = 0;
                }
                
                // Ensure correlation is within bounds
                corrMatrix[i][j] = Math.max(-1, Math.min(1, corrMatrix[i][j]));
            }
        }
    }
    
    return corrMatrix;
}

// Utility functions

// Calculate mean
function mean(values) {
    if (!values || values.length === 0) return NaN;
    const sumVal = values.reduce((acc, val) => acc + val, 0);
    return sumVal / values.length;
}

// Calculate variance
function variance(values) {
    if (!values || values.length <= 1) return NaN;
    const m = mean(values);
    const squaredDiffs = values.map(val => Math.pow(val - m, 2));
    return sum(squaredDiffs) / (values.length - 1);
}

// Calculate covariance
function covariance(x, y) {
    if (!x || !y || x.length !== y.length || x.length <= 1) return NaN;
    
    const xMean = mean(x);
    const yMean = mean(y);
    
    let covar = 0;
    for (let i = 0; i < x.length; i++) {
        covar += (x[i] - xMean) * (y[i] - yMean);
    }
    
    return covar / (x.length - 1);
}

// Calculate correlation
function correlation(x, y) {
    const covar = covariance(x, y);
    const sdX = Math.sqrt(variance(x));
    const sdY = Math.sqrt(variance(y));
    
    if (sdX <= 0 || sdY <= 0) return 0;
    return covar / (sdX * sdY);
}

// Calculate sum
function sum(values) {
    return values.reduce((acc, val) => acc + val, 0);
}

// Format number to 3 decimal places
function formatNumber(value) {
    if (isNaN(value)) return 'N/A';
    return value.toFixed(3);
}