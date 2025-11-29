import { animatieBubble, genereazaGrafic, genereazaTabel } from './grafice.js';
import { genereazaBubble } from './grafice.js';

let allData = [];
let years;

//preluam date la incarcarea paginii
window.addEventListener("DOMContentLoaded", async () => {
    try {

        //container pentru datele preluate de pe eurostat
        let data = [];

        //calculul anului de la care se porneste preluarea datelor
        const currentYear = new Date().getFullYear();
        const year = currentYear - 15;

        //alegerea tarilor/parametrul geo din api
        const countriesUE = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
        const geoCountries = countriesUE.map(tara => `&geo=${tara}`).join('');

        //preluare date speranta la viata(SV)
        const response1 = await fetch(`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_mlexpec?format=JSON&sinceTimePeriod=${year}${geoCountries}&unit=YR&sex=T&age=Y1&lang=EN`);
        const lifeExp = await response1.json();

        //procesare date si inserare in container
        const geoMap1 = lifeExp.dimension.geo.category.index; //indecsii tarilor: 0, 1, ...
        const timeMap1 = lifeExp.dimension.time.category.index; //indecsii anilor: 0, 1, ...
        Object.keys(geoMap1).forEach(countryCode => { //codurile tarilor: "BE", "BG", ...
            const idGeo = geoMap1[countryCode]; //valorile codurilor: "Belgium", "Bulgaria", ...
            Object.keys(timeMap1).forEach(yearCode => { //anii: "2010", "2011", ...
                const idTime = timeMap1[yearCode]; //valorile label-urilor: "2010", "2011", ...
                const flatIndex = (idGeo * 15) + idTime; //indexul valorii (SV) pentru tara 0 ("BE") si anul 0 ("2010")
                if(lifeExp.value[flatIndex]){
                    data.push({ //inserare date in container
                        "tara": countryCode,
                        "an": yearCode,
                        "indicator": "SV",
                        "valoare": lifeExp.value[flatIndex]
                    });
                }
            })
        });

        //preluare date populatia
        const response2 = await fetch(`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?format=JSON&sinceTimePeriod=${year}${geoCountries}&unit=NR&age=Y1&sex=T&lang=EN`);
        const pop = await response2.json();

        const geoMap2 = pop.dimension.geo.category.index;
        const timeMap2 = pop.dimension.time.category.index;
        Object.keys(geoMap2).forEach(countryCode => {
            const idGeo = geoMap2[countryCode];
            Object.keys(timeMap2).forEach(yearCode => {
                const idTime = timeMap2[yearCode];
                const flatIndex = (idGeo * 15) + idTime;
                data.push({
                    "tara": countryCode,
                    "an": yearCode,
                    "indicator": "POP",
                    "valoare": pop.value[flatIndex]
                });
            });
        });

        //preluare date PIB per cap de locuitor
        const response3 = await fetch(`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sdg_08_10?format=JSON&sinceTimePeriod=${year}${geoCountries}&unit=CLV20_EUR_HAB&na_item=B1GQ&lang=EN`);
        const gdpPerCapita = await response3.json();

        const geoMap3 = gdpPerCapita.dimension.geo.category.index;
        const timeMap3 = gdpPerCapita.dimension.time.category.index;
        Object.keys(geoMap3).forEach(countryCode => {
            const idGeo = geoMap3[countryCode];
            Object.keys(timeMap3).forEach(yearCode => {
                const idTime = timeMap3[yearCode];
                const flatIndex = (idGeo * 15) + idTime;
                data.push({
                    "tara": countryCode,
                    "an": yearCode,
                    "indicator": "PIB",
                    "valoare": gdpPerCapita.value[flatIndex]
                });
            });
        });

        //se transmit datele serverului pentru crearea fisierului json
        await fetch("/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })

        //preluam din fisier datele in variabila globala
        const response = await fetch('./media/data.json');
        allData = await response.json();

        //preluam anii si populam dropdown-ul pentru bubble chart si data table
        years = [... new Set(allData.map(d => d.an))];
        const select = document.querySelectorAll(".years");
        select.innerHTML = "";

        select.forEach(s => {
            years.forEach(y => {
                const opt = document.createElement("option");
                opt.value = y;
                opt.textContent = y;
                s.appendChild(opt);
            });
        })
        

    } catch (error) {

        //altfel, preluam datele din fisierul local
        const response = await fetch('./media/eurostat2000-2018.json');
        allData = await response.json();

        //preluam anii si populam dropdown-ul pentru bubble chart si data table
        years = [... new Set(allData.map(d => d.an))];
        const select = document.querySelectorAll(".years");
        select.innerHTML = "";

        select.forEach(s => {
            years.forEach(y => {
                const opt = document.createElement("option");
                opt.value = y;
                opt.textContent = y;
                s.appendChild(opt);
            });
        })
        
    }
})

//pregatim datele pentru generarea graficului
document.getElementById("btn").addEventListener("click", () => {
    const indicator = document.getElementById("indicatori").value;
    const country = document.getElementById("countries").value;
    
    const filteredData = allData.filter(d => 
        d.tara === country &&
        d.indicator === indicator
    );

    const txtIndicator = document.getElementById("indicatori").selectedOptions[0].text;
    const txtCountry = document.getElementById("countries").selectedOptions[0].text;

    genereazaGrafic(filteredData, txtCountry, txtIndicator);
});

//pregatim datele pentru bubble chart
document.getElementById("btn2").addEventListener("click", () => {
    const year = document.getElementById("y1").value;

    const filteredData = allData.filter(d => 
      d.an === year  
    );

    genereazaBubble(filteredData);
});

//animatie bubble chart
document.getElementById("btn3").addEventListener("click", () => {

    animatieBubble(allData, years);

});

//pregatim datele pentru data table
document.getElementById("btn4").addEventListener("click", () => {

    const year = document.getElementById("y2").value;

    const filteredData = allData.filter(d => 
        d.an === year
    );

    document.getElementById("body").innerHTML = "";

    genereazaTabel(filteredData);

});