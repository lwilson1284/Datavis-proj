const width = 960;
const height = 600;
const sliders = document.querySelectorAll('.slider');
const sliderValues = document.querySelectorAll('.slider-value');
const selectedValues = document.getElementById('selected-values');

const housePrice = document.getElementById('housePrice');
const testScores = document.getElementById('testScores');
const weather = document.getElementById('weather');
const crimeRate = document.getElementById('crimeRate');

const housePriceOut = document.getElementById('housePriceOut');
const testScoresOut = document.getElementById('testScoresOut');
const weatherOut = document.getElementById('weatherOut');
const crimeRateOut = document.getElementById('crimeRateOut');



const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa();

const path = d3.geoPath()
    .projection(projection);

d3.json("../data/usa-counties.json").then(us => {
    const georgiaCounties = topojson.feature(us, us.objects.USAdrop1).features
        .filter(d => d.properties.CoState.endsWith("Georgia")); // Filter by Georgia

    // scale up the Georgia counties
    projection.fitSize([width, height], {type: "FeatureCollection", features: georgiaCounties});

    svg.append("g")
      .selectAll("path")
      .data(georgiaCounties)
      .join("path")
        .attr("d", path)
        .style("fill", "lightblue") // background fill
        .style("stroke", "#31708f") // county line color
        .style("stroke-width", "1px");
});
function updateSliderValue(index, value) {
    sliderValues[index].textContent = value;
}


function displaySelectedValues() {
    let values = '';
    sliders.forEach((slider, index) => {
        values += `${slider.dataset.label}: ${slider.value}, `;
    });

    selectedValues.textContent = values.slice(0, -2); 
}
sliders.forEach((slider, index) => {
    slider.addEventListener('input', () => {
    
        updateSliderValue(index, slider.value);
        displaySelectedValues();
    });
});
function fetchHousingData() {
    fetch('../cleaned_housing_data.csv')
        .then(response => response.text())
        .then(csvData => {
            const data = d3.csvParse(csvData);

            const container = document.getElementById('data-container');
            container.innerHTML = '';
            container.append("Houses");

            data.forEach(row => {
                const rowElement = document.createElement('div');
               
                if (parseInt(row.March292024) < parseInt(housePrice.value)) {
                    rowElement.textContent = `ZipCode: ${row.RegionName}, City: ${row.City}, House Price : ${row.March292024}`;
                    container.appendChild(rowElement);
                }
            
            });
        })
        .catch(error => {
            console.error('Error fetching CSV data:', error);
        });
}
function fetchSchoolData() {
    fetch('../school_data.csv')
        .then(response => response.text())
        .then(csvData => {
            const data = d3.csvParse(csvData);

            const container2 = document.getElementById('data-container2');
            container2.innerHTML = '';
            container2.append("School");

            data.forEach(row => {
                const rowElement = document.createElement('div');
                
                
                if (parseInt(row.SAT_AVG_SCORE) > parseInt(testScores.value)) {
                    rowElement.textContent = `School: ${row.INSTN_NAME_x}, County: ${row.SCHOOL_DSTRCT_NM_SAT}, SAT Score : ${row.SAT_AVG_SCORE}`;
                    container2.appendChild(rowElement);
                }
            

                
            });
        })
        .catch(error => {
            console.error('Error fetching CSV data:', error);
        });
}

window.addEventListener('load', fetchHousingData);
housePrice.addEventListener('input', fetchHousingData);

window.addEventListener('load', fetchSchoolData);
testScores.addEventListener('input', fetchSchoolData);


