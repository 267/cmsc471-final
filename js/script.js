/* Column/Stats Meaning
  ********* BATTING STATS *********
  ab --> At-Bats
  avg_best_speed --> Average of the hardest 50% of a hitters batted balls (any instance where a batter makes contact with a ball, can be a ball hit into fair or foul territory)
  avg_hyper_speed --> averages the maximum of 88 and exit velocity of each batted ball
  barrel --> a perfect combination of exit velocity and launch angle (min of 98 MPH exit velo and launch angle between 26-30 degrees). for every 1 MPH faster than 98, the launch angle expands by 1 degree. Ex: a exit velo of 99 MPH needs a launch angle of (25-31 degrees to be considered Barreled)
  barrel_batted_rate --> 
*/

/*
TODO:
Main plot: scatterplot with axis being the above options from the csv file
Secondary plot: Hoving over datapoint gives a spider plot for the given player and all their relevant stats above
*/

const margin = { top: 80, right: 60, bottom: 60, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

async function init() {
  d3.csv("./data/stats.csv").then((data) => {
    console.log(data);
  })
}
window.addEventListener("load", init);
