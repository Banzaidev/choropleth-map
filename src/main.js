import './style.css'
import * as d3 from "d3";
import { feature } from 'topojson-client';

document.querySelector('#app').innerHTML = `
  <div>
    <h1 id='title'>United States Educational Attainment</h1>
    <h4 id='description'>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h4>
    <div id='legend'></div>
    <div id='graph'></div>
    <div id='tooltip'></div>

  </div>
`

const graphSize = {
  width: 1000,
  height: 650,
  legendWidth: 300,
  legendHeight: 50,
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


const scaleLegendColors = d3.scaleLinear()
.domain([d3.min(educationJSON, data => data.bachelorsOrHigher), d3.max(educationJSON, data => data.bachelorsOrHigher)])
.range(['white','red'])
.interpolate(d3.interpolateHcl)

const scaleLegend = d3.scaleLinear()
.domain([d3.min(educationJSON, data => data.bachelorsOrHigher), d3.max(educationJSON, data => data.bachelorsOrHigher)])
.range([0,graphSize.legendWidth])

let rectsLegend = d3.range(d3.min(educationJSON, data => data.bachelorsOrHigher), d3.max(educationJSON, data => data.bachelorsOrHigher))


d3.select('#legend')
.append('svg')
.attr('height',graphSize.legendHeight)
.attr('width',graphSize.legendWidth)
.append('g')
.call(d3.axisBottom(scaleLegend).tickSize(10))
//tickSize per evitare che siano coperti dai rect

d3.select('#legend > svg')
.selectAll('rect')
.data(rectsLegend)
.enter()
.append('rect')
.attr('width',(graphSize.legendWidth / rectsLegend.length)+0.5)
.attr('x',d => scaleLegend(d))
.attr('y',0.5)
.attr('fill',d => scaleLegendColors(d))
.attr('height',6)



d3.select('#graph > svg')
.append('g')
.selectAll('path')
.data(geoJSON)
.enter()
.append('path')
.attr('d', path) 
.attr('stroke','white')
.attr('stroke-width','0.2px')
.attr('class','county')
.attr('data-fips', data => data.id)

const toolTip = d3.select('#tooltip')

d3.selectAll('path')
.on('mouseover',(e)=>{

  if(toolTip.property('hidden')){
    toolTip.property('hidden',false)

  }


  const county = e.target
  const dataEducation  = county.getAttribute('data-education')
  const state = county.getAttribute('state') 
  const areaName = county.getAttribute('areaName')
  
  toolTip.attr('data-education',dataEducation)
  toolTip.attr('state',state)
  toolTip.attr('areaName',areaName)
  toolTip.html(`<h6>${areaName}, ${state} : ${dataEducation}%</h6>`)
  

})

d3.selectAll('path')
.on('mouseout',()=>{
  toolTip.property('hidden',true)
})

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
      element.setAttribute('fill',scaleLegendColors(educationData))
    }
  })
});