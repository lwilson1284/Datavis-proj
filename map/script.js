const width = 960;
const height = 600;
const sliders = document.querySelectorAll('.slider');
const sliderValues = document.querySelectorAll('.slider-value');
const selectedValues = document.getElementById('selected-values');

const housePrice = document.getElementById('housePrice');
const satScores = document.getElementById('satScores');
const hopeEligibilty = document.getElementById('hopeEligibilty');
const graduationRate = document.getElementById('graduationRate');

const housePriceOut = document.getElementById('housePriceOut');
const satScoresOut = document.getElementById('satScoresOut');
const hopeEligibilityOut = document.getElementById('hopeEligibilityOut');
const graduationRateOut = document.getElementById('graduationRateOut');



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

                const roundedHousePrice = parseFloat(row.March292024).toFixed(2);
               
                if (parseInt(row.March292024) < parseInt(housePrice.value)) {
                    rowElement.textContent = `ZipCode: ${row.RegionName}, City: ${row.City}, County: ${row.CountyName}, House Price: $${row.March292024}`;
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
                
                
                if (parseInt(row.SAT_AVG_SCORE) > parseInt(satScores.value) && parseInt(row.HOPE_ELIGIBLE_PCT) > parseInt(hopeEligibilty.value) && parseInt(row.PROGRAM_PERCENT) > parseInt(graduationRate.value)) {
                    rowElement.textContent = `${row.INSTN_NAME_x}, County: ${row.SCHOOL_DSTRCT_NM_SAT}, SAT Score : ${row.SAT_AVG_SCORE}, Hope Elegibility: ${row.HOPE_ELIGIBLE_PCT}%, Graduation Rate: ${row.PROGRAM_PERCENT}%`;
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
satScores.addEventListener('input', fetchSchoolData);
hopeEligibilty.addEventListener('input', fetchSchoolData);
graduationRate.addEventListener('input', fetchSchoolData);

