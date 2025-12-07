
//Line Chart
export function genereazaGrafic(data, country, indicator) {

    //afisare titlu in functie de tara si indicatorul alesi
    const title = document.getElementById("graphTitle");
    title.textContent = `${indicator} for ${country}`;
    title.style.visibility = "visible";

    //afisare notita despre ToolTip
    document.getElementById("note").style.visibility = "visible";

    const values = data.map(d => d.valoare);
    const years = data.map(d => d.an);

    const svg = document.getElementById("grafic");
    svg.innerHTML = "";

    const width = 400;
    const height = 200;
    const padding = 10;
    const drawHeight = height - 2 * padding;

    //coordonate si dimensiuni svg
    svg.setAttribute("viewBox", `0, 0, ${width} ${height}`);

    const maxValue = Math.max(...values);

    //ToolTip
    const tooltipText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltipText.setAttribute("font-size", "10");
    tooltipText.setAttribute("fill", "var(--dark-pink)");
    tooltipText.setAttribute("text-anchor", "middle");
    tooltipText.style.visibility = "hidden";

    svg.appendChild(tooltipText);

    //puncte - valorile indicatorului
    let points = values.map((val, i) => {
        
        //coordonata x se obtine adunand padding-ul initial cu indicele punctului inmultit cu distanta fixa dintre 2 puncte
        let x = padding + (i * (width - 2 * padding) / (values.length - 1)); 
        //coordonata y se obtine scazand din baza valoarea curenta(intre 0 si 1) inmultita cu inaltimea svg-ului fara paddinguri
        let y = (height - padding) - (val / maxValue - 0.5) * drawHeight;

        //detalii grafice tooltip
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 4);
        circle.setAttribute("fill", "var(--pastel-pink)");
        circle.setAttribute("opacity", 0);

        //aparitie cerc la coordonatele x, y
        circle.addEventListener("mouseover", (e) => {
            tooltipText.setAttribute("x", x);
            tooltipText.setAttribute("y", y - 10); 
            
            tooltipText.textContent = `${years[i]}: ${val.toFixed(2)}`; //detalii despre valoare
            tooltipText.style.visibility = "visible";
            
            e.target.setAttribute("opacity", 1); 
        });

        //stergere cand mouse-ul iese din raza cercului
        circle.addEventListener("mouseout", (e) => {
            tooltipText.style.visibility = "hidden";
            e.target.setAttribute("opacity", 0);
        });

        svg.appendChild(circle);

        return `${x}, ${y}`; //returnare coordonate
    }).join(" ");

    //creare line chart din coordonatele punctelor
    let line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", points);
    line.setAttribute("fill", "none");
    line.setAttribute("stroke", "gray");
    line.setAttribute("stroke-width", "1");

    svg.insertBefore(line, tooltipText); //line chart-ul va aparea in spatele cercurilor
}

let bubbleChart;

//Bubble Chart
export function genereazaBubble(rawData){
    
    const canvas = document.getElementById("bubbleChart");
    const ctx = canvas.getContext("2d");
    const bubbleYear = document.getElementById("bubbleYear");

    //modificam datele a.i. indicatorii sa contina valorile corespunzatoare
    const mapData = {};

    rawData.forEach(d => {
        const key = d.tara + "-" + d.an;
        if(!mapData[key]) {
            mapData[key] = {tara: d.tara, an: d.an};
        }
        mapData[key][d.indicator] = d.valoare;
    });

    //valori hashmap
    let data = Object.values(mapData);

    //Exemplu output: {tara: 'BE', an: '2010', SV: 79.6, POP: 128082, PIB: 39420}
    
    //pregatire date svg x, y, r (r - raza bubble)
    data = data.map(d => ({
        x: d.PIB,
        y: d.SV,
        r: Math.sqrt(d.POP / 1000), //standardizare
        country: d.tara,
        an: d.an
    }));

    //afisare dreapta jos an curent
    bubbleYear.textContent = `${data[0].an}`;

    //daca nu exista - creare bubble chart
    if(!bubbleChart){
        bubbleChart = new Chart(ctx, {
            type: "bubble",
            data: {
                datasets: [{
                    label: "Countries",
                    data: data,
                    backgroundColor: "rgba(255,99,132,0.5)"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuad'
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                //context.raw este obiectul punctului: {x, y, r, country}
                                return context.raw.country + ": x=" 
                                    + context.raw.x + ", y="
                                    + context.raw.y;
                            }
                        }
                    }
                }
            }
        });
    } else { //daca exista deja - rescriere data
        bubbleChart.data.datasets[0].data = data;
        bubbleChart.update(); 
    }

}

//Animatie Bubble Chart
export function animatieBubble(rawData, years){

    let index = 0;

    //pentru fiecare an din interval se va genera bubble chart
    const interval = setInterval(() => {

        if (index >= years.length) { 
            clearInterval(interval);
            return;
        }

        const currentYear = years[index];

        //filtrare date pentru anul curent
        const filtered = rawData.filter(d => 
            d.an === currentYear  
        );

        genereazaBubble(filtered);

        index++;

    }, 800);//durata milisecunde
}

//Tabel de date
export function genereazaTabel(data){

    //modificare date indicator - valoare
    const mapData = {};

    data.forEach(d => {
        const key = d.tara + "-" + d.an;
        if(!mapData[key]) {
            mapData[key] = {tara: d.tara, an: d.an};
        }
        mapData[key][d.indicator] = d.valoare;
    });

    data = Object.values(mapData);

    //preluare valori
    const valoriSV  = data.map(d => d.SV);
    const valoriPIB = data.map(d => d.PIB);
    const valoriPOP = data.map(d => d.POP);

    //calcul medie cu 2 zecimale pentru fiecare indicator
    const medieSV = (valoriSV.reduce((a, b) => a + b, 0) / valoriSV.length).toFixed(2);
    const mediePIB = (valoriPIB.reduce((a, b) => a + b, 0) / valoriPIB.length).toFixed(2);
    const mediePOP = (valoriPOP.reduce((a, b) => a + b, 0) / valoriPOP.length).toFixed(2);

    //afisare info
    document.getElementById("info").innerHTML = `<br>Life Expectancy's average: ${medieSV}<br><br>GDP Per Capita's average: ${mediePIB}<br><br>Population's average: ${mediePOP}`;

    //calcularea maximului abaterilor fata de medie
    const difMaxSV = Math.max(...valoriSV.map(d => Math.abs(d - medieSV)));
    const difMaxPIB = Math.max(...valoriPIB.map(d => Math.abs(d - mediePIB)));
    const difMaxPOP = Math.max(...valoriPOP.map(d => Math.abs(d - mediePOP)));
    
    //creare tabel
    const table = document.getElementById("table");
    const body = document.getElementById("body");

    data.forEach(d => {

        const tr = document.createElement("tr");

        let td = document.createElement("td");
        td.textContent = `${d.tara}`;
        td.style.color = 'rgb(165, 24, 139)';
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = `${d.SV}`;

        //calcularea intensitatii culorii celulei in functie de abaterea valorii fata de medie
        let dif = d.SV - medieSV;
        if(dif < 0)
            td.style.backgroundColor = `rgba(153, 0, 76, ${Math.abs(dif / difMaxSV)})`; //valoare sub medie - visiniu
        else
            td.style.backgroundColor = `rgba(0, 102, 0, ${Math.abs(dif / difMaxSV)})`; //vaoare peste medie - verde

        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = `${d.PIB}`;

        //idem
        dif = d.PIB - mediePIB;
        if(dif < 0)
            td.style.backgroundColor = `rgba(153, 0, 76, ${Math.abs(dif / difMaxPIB)})`;
        else
            td.style.backgroundColor = `rgba(0, 102, 0, ${Math.abs(dif / difMaxPIB)})`;

        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = `${d.POP}`;

        //idem
        dif = d.POP - mediePOP;
        if(dif < 0)
            td.style.backgroundColor = `rgba(153, 0, 76, ${Math.abs(dif / difMaxPOP)})`;
        else
            td.style.backgroundColor = `rgba(0, 102, 0, ${Math.abs(dif / difMaxPOP)})`;

        tr.appendChild(td);

        body.appendChild(tr);

    })

    table.appendChild(body);

}