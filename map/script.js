const width = 960;
const height = 600;
const sliders = document.querySelectorAll('.slider');
const sliderValues = document.querySelectorAll('.slider-value');

const housePrice = document.getElementById('housePrice');
const satScores = document.getElementById('satScores');
const hopeEligibility = document.getElementById('hopeEligibility');
const graduationRate = document.getElementById('graduationRate');

const svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoAlbersUsa();
const path = d3.geoPath().projection(projection);

function initMap() {
    d3.json("../data/usa-counties.json").then(us => {
        const georgiaCounties = topojson.feature(us, us.objects.USAdrop1).features
            .filter(d => d.properties.CoState.endsWith("Georgia"));

        projection.fitSize([width, height], {type: "FeatureCollection", features: georgiaCounties});

        svg.append("g")
          .selectAll("path")
          .data(georgiaCounties)
          .join("path")
            .attr("d", path)
            .style("fill", "lightblue")
            .style("stroke", "#31708f")
            .style("stroke-width", "1px");
    });
}

function fetchHousingData() {
    fetch('../cleaned_housing_data.csv')
        .then(response => response.text())
        .then(csvData => {
            const data = d3.csvParse(csvData);
            const container = document.getElementById('data-container');
            container.innerHTML = '';

            const table = document.createElement('table');
            const headerRow = table.insertRow();
            ['ZipCode', 'City', 'County', 'House Price'].forEach(headerText => {
                const headerCell = document.createElement('th');
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });

            data.forEach(row => {
                if (parseInt(row.March292024) <= parseInt(housePrice.value)) {
                    const rowElement = table.insertRow();
                    [row.RegionName, row.City, row.CountyName, `$${row.March292024}`].forEach(cellText => {
                        const cell = rowElement.insertCell();
                        cell.textContent = cellText;
                    });
                }
            });

            container.appendChild(table);
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
            const container = document.getElementById('data-container2');
            container.innerHTML = '';

            const table = document.createElement('table');
            const headerRow = table.insertRow();
            ['Institution Name', 'County', 'SAT Score', 'Hope Eligibility', 'Graduation Rate'].forEach(headerText => {
                const headerCell = document.createElement('th');
                headerCell.textContent = headerText;
                headerRow.appendChild(headerCell);
            });

            data.forEach(row => {
                if (parseInt(row.SAT_AVG_SCORE) >= parseInt(satScores.value) && 
                    parseInt(row.HOPE_ELIGIBLE_PCT) >= parseInt(hopeEligibility.value) &&
                    parseInt(row.PROGRAM_PERCENT) >= parseInt(graduationRate.value)

                    ) {
                    const rowElement = table.insertRow();
                    [row.INSTN_NAME_x, row.SCHOOL_DSTRCT_NM_SAT, row.SAT_AVG_SCORE, `${row.HOPE_ELIGIBLE_PCT}%`, `${row.PROGRAM_PERCENT}%`].forEach(cellText => {
                        const cell = rowElement.insertCell();
                        cell.textContent = cellText;
                    });
                }
            });

            container.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching CSV data:', error);
        });
}

function showTable(type) {
    document.getElementById('data-container').style.display = type === 'housing' ? 'block' : 'none';
    document.getElementById('data-container2').style.display = type === 'school' ? 'block' : 'none';
}

sliders.forEach(slider => {
    slider.addEventListener('input', () => {
        const sliderId = slider.getAttribute('id');
        const sliderOut = document.getElementById(`${sliderId}Out`);
        sliderOut.textContent = slider.value;

        if (sliderId === 'housePrice') {
            fetchHousingData();
        } else if (sliderId === 'satScores' || sliderId === 'hopeEligibility' || sliderId === 'graduationRate') {
            fetchSchoolData();
            if (document.getElementById('showSchoolsBtn').classList.contains('active')) {
                loadSchoolLocations();
            }
        }
    });
});

function loadSchoolLocations() {
    Promise.all([
        d3.csv("../data/school_coords.csv"),
        d3.csv("../school_data.csv")
    ]).then(([coords, data]) => {
        const filteredSchools = data.filter(d => 
            parseInt(d['SAT_AVG_SCORE']) >= parseInt(satScores.value) &&
            parseInt(d['HOPE_ELIGIBLE_PCT']) >= parseInt(hopeEligibility.value) &&
            parseInt(d['PROGRAM_PERCENT']) >= parseInt(graduationRate.value)
        );
        
        const filteredCoords = coords.filter(coord => 
            filteredSchools.some(school => school['INSTN_NAME_x'] === coord['School name'])
        );

        let schoolsGroup = svg.select(".schools");
        if (schoolsGroup.empty()) {
            schoolsGroup = svg.append("g").attr("class", "schools");
        } else {
            schoolsGroup.selectAll("*").remove();
        }

        const schools = schoolsGroup.selectAll("image")
            .data(filteredCoords, d => d['School name']);

        schools.enter().append("image")
            .attr("xlink:href", "../school-icon.png")
            .attr("width", 20)
            .attr("height", 20)
            .attr("transform", d => {
                const coords = projection([+d.Longitude, +d.Latitude]);
                return `translate(${coords[0] - 10}, ${coords[1] - 10})`;
            });

        schools.exit().remove();
    });
}


function showSchools() {
    const schoolsGroup = svg.select(".schools");
    const button = document.getElementById('showSchoolsBtn');

    if (schoolsGroup.empty()) {
        loadSchoolLocations();
        button.classList.add('active');
    } else {
        const isVisible = schoolsGroup.style("display") !== "none";
        schoolsGroup.style("display", isVisible ? "none" : "block");
        
        if (isVisible) {
            button.classList.remove('active');
        } else {
            button.classList.add('active');
        }
    }

    document.getElementById('data-container').style.display = 'none';
    document.getElementById('data-container2').style.display = 'block';
}

window.addEventListener('load', () => {
    initMap();
    fetchHousingData();
    fetchSchoolData();
});