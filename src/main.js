import './style.css'
import * as d3 from "d3";
import { feature } from 'topojson-client';

document.querySelector('#app').innerHTML = `
  <div>
    <h1 id='title'>United States Educational Attainment</h1>
    <h4 id='description'>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
    <div id='graph'></div>
  </div>
`

const graphSize = {
  width: 1000,
  height: 1000
}

d3.select('#graph')
.append('svg')
.attr('width',graphSize.width)
.attr('height',graphSize.height)

//const projection = d3.geoAlbersUsa() Serve per creare una proiezione geografica predefinita degli stati uniti, e da solo
// può convertitre latitudine e longitudine in pixel 
const path = d3.geoPath()
/* d3.geoPath() serve a generare  percorsi svg, sfruttando i dati GeoJSON (coordinate lat e long)
sfruttando d3.geoPath().projection(proiezione d3.geoAlbersUsa()) */
/* Non devo applicare un ulteriore proiezione perché i dati nel file JSON sono pre proiettati */


const dataCountyJSON = await d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json').then(data => data)
const geoJSON = feature(dataCountyJSON, dataCountyJSON.objects.counties).features

//feature(dati da d3.json, oggetto specifico che contiene i dati) restituisce un oggetto e i dati geoJSON ottenuti dal topoJSON sono contenuti in features
/* I dati nel file JSON sono espressi sottoforma di TopoJSON questo vuol dire che sono espressi sottoforma di archi condivisi 
I dati in un geoJSON esprimono la geometria con punti, linee e poligoni disposti in coordinae geografiche (latitudine e longitudine) */

const educationJSON = await d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json').then(data => data)


 
d3.select('#graph > svg')
.append('g')
.selectAll('path')
.data(geoJSON)
.enter()
.append('path')
.attr('d', path) 
.attr('fill', '#ccc')
.attr('stroke','white')
.attr('class','county')
.attr('data-fips', data => data.id)


const counties = d3.selectAll('.county')
counties['_groups'][0].forEach(element => {
  const dataFipsElem = element.getAttribute('data-fips')
  educationJSON.forEach(data => {
    const educationData  = data.bachelorsOrHigher
    const stateData = data.state
    const areaNameData = data.area_name
    if(dataFipsElem == data.fips){
      element.setAttribute('data-education',educationData)
      element.setAttribute('state', stateData)
      element.setAttribute('areaName',areaNameData)
    }
  })
});