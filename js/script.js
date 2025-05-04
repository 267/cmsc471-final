/* Column/Stats Meaning
  ********* BATTING STATS *********
  * ab --> At-Bats ==> When a batter reaches base via a fielder's choice, hit or an error 
    or when a batter is put out on a non-sacrifice
  * avg_best_speed --> Average of the hardest 50% of a hitters batted balls (any instance where a batter
    makes contact with a ball, can be a ball hit into fair or foul territory)
  * avg_hyper_speed --> Averages the maximum of 88 and exit velocity of each batted ball
  * barrel --> A perfect combination of exit velocity and launch angle (min of 98 MPH exit velo and launch
    angle between 26-30 degrees). for every 1 MPH faster than 98, the launch angle expands by 1 degree. Ex: a exit velo of 99 MPH needs a launch angle of (25-31 degrees to be considered Barreled)
  * barrel_batted_rate --> # of barrels / # of Batted Balls
  * batting_average --> # of base hits / # of At-Bats
  * bb_percent --> Percentage of plate appearnces that end in a walk
  * exit_velocity_avg --> The sum of all exit velocities (how fast a ball comes off the bat) / 
    Batted Ball Events (any batted ball, foul or fair, that produces a result ex: out, hits or errors.)
  * hard_hit_percentage --> Batted balls with an exit velocity of 95 MPH (where exit velocity begins to
    matter)
  * hit --> When a hitter strikes a ball into fair territory and reaches base
  * home_run --> Ball hit over the outfield fence, or hitting a ball and scoring on the same play without
    being put out because of an error (uncommon)
  * k_percent --> # of strikeouts per plate apparence
  * launch_angle_average --> Sum of all launch angles (except bunts) / # of Batted Ball Events
  * on_base_percent --> How frequently a player reaches base per plate appearance (does not include errors)
  * on_base_plus_slg --> Adds on base percentage plus slugging percentage (Total # of bases a player 
    records per at-bat. Does not incude wlaks and hit-by-pitches).
  * pa --> # of turns at the plate and a result between a batter and pitcher is obtained.
  * slg_percent --> Total # of bases a player records per at-bat (hits are not valued Equally). 
    * Formula = (# of singles + # of doubles * 2 + # of triples * 3 + # of Home Runs * 4)/AB
  * solidcontact_percent --> I legit have no idea. 
  * strikeout --> the third strike coming from a batter swinging and missing, or being called a strike 
    while the batter does not attempt a swing.
  * sweet_spot_percent --> a batted-ball event with a launch angle between 8 to 32 degrees
  * swing_percent --> # of swings / # of pitches thrown.
  * walk --> When a pitcher throws 4 pitches out of the zone and is called a Ball.
  * whiff_percent --> # of swings where the batter makes no contact on the ball / total swings.
  * woba --> Weighted On-Base Percentage where the value for each method of reaching base is determined by
    how much that event is worth in relation to projected runs scored
  * xba --> Expected Batting Average: the likelihood that a batted ball will become a hit based on exit 
    velocity, launch angle, on certin types of batted balls. xBA is given a figure based on balls with similar exit velocities, and launch angle
  * xobp --> Expected On-base Percentage based on the quality of contact, and the player's speed.
  * xslg --> Expected Slugging, uses exit velocity, launch angle, and Sprint speed on certian types of 
    batted balls. Removes defense from the equation to calcualte quality of contact, instead of actual outcomes
  * xwoba --> Expected Weighted On-Base Percentage, uses same formula as woba but removes defense from the 
    equation and uses exit-velocity and launch angle and uses these to determine the probability of the type of hit the batted ball is going to be.

  ********* DEFENSIVE STATS *********
  * n_outs_above_average --> How many outs a player has saved. Takes into accoount:
    * Catch Probability --> The distance, time. and direction traveled to get to the ball
  * rel_league_reaction_dsitance --> feet covered in the first 1.5 seconds.
  ********* PHYSICAL STATS *********
  * rel_league_burst_distnce --> amount of feet covered if the first 1.5 seconds after a player finishes
    their swing and established forward momentum. (How quick a player is able to accelerate)
  * sprint_speed --> how many feet per second a player runs in his fastest one-second window.
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

let xVar = "ab";
let yVar = "avg_best_speed";
let xScale;
let yScale;

const options = {
  ab: "At-Bats",
  avg_best_speed: "Avg Best Speed",
  avg_hyper_speed: "Avg Hyper Speed",
  barrel: "Barrel",
  barrel_batted_rate: "Barrel Batted Rate",
  batting_average: "Batting Average",
  bb_percent: "Walk Percentage",
  exit_velocity_avg: "Exit Velocity Avg",
  hard_hit_percentage: "Hard Hit Percentage",
  hit: "Hits",
  home_run: "Home Runs",
  k_percent: "Strikeout Percentage",
  launch_angle_average: "Launch Angle Avg",
  on_base_percent: "On-Base Percentage",
  on_base_plus_slg: "On-Base Plus Slugging",
  pa: "Plate Appearances",
  slg_percent: "Slugging Percentage",
  solidcontact_percent: "Solid Contact Percentage",
  strikeout: "Strikeouts",
  sweet_spot_percent: "Sweet Spot Percentage",
  swing_percent: "Swing Percentage",
  walk: "Walks",
  whiff_percent: "Whiff Percentage",
  woba: "Weighted On-Base Average",
  xba: "Expected Batting Average",
  xobp: "Expected On-Base Percentage",
  xslg: "Expected Slugging",
  xwoba: "Expected Weighted On-Base Average",
  n_outs_above_average: "Outs Above Average",
  rel_league_reaction_dsitance: "Reaction Distance (ft)",
  rel_league_burst_distnce: "Burst Distance (ft)",
  sprint_speed: "Sprint Speed (ft/s)",
};

d3.selectAll(".variable")
  .each(function () {
    d3.select(this)
      .selectAll("myOptions")
      .data(Object.keys(options))
      .enter()
      .append("option")
      .text((d) => options[d])
      .attr("value", (d) => d);
  })
  .on("change", function () {
    switch (d3.select(this).property("id")) {
      case "xVariable":
        xVar = d3.select(this).property("value");
        break;
      case "yVariable":
        yVar = d3.select(this).property("value");
        break;
    }
    update();
  });
d3.select("#xVariable").property("value", xVar);
d3.select("#yVariable").property("value", yVar);



const data = await d3.csv("data/stats.csv", (d) => ({
  player_id: d.player_id,
  ab: parseFloat(d.ab),
  avg_best_speed: parseFloat(d.avg_best_speed),
  avg_hyper_speed: parseFloat(d.avg_hyper_speed),
  barrel: parseFloat(d.barrel),
  barrel_batted_rate: parseFloat(d.barrel_batted_rate),
  batting_average: parseFloat(d.batting_average),
  bb_percent: parseFloat(d.bb_percent),
  exit_velocity_avg: parseFloat(d.exit_velocity_avg),
  hard_hit_percentage: parseFloat(d.hard_hit_percentage),
  hit: parseFloat(d.hit),
  home_run: parseFloat(d.home_run),
  k_percent: parseFloat(d.k_percent),
  launch_angle_average: parseFloat(d.launch_angle_average),
  on_base_percent: parseFloat(d.on_base_percent),
  on_base_plus_slg: parseFloat(d.on_base_plus_slg),
  pa: parseFloat(d.pa),
  slg_percent: parseFloat(d.slg_percent),
  solidcontact_percent: parseFloat(d.solidcontact_percent),
  strikeout: parseFloat(d.strikeout),
  sweet_spot_percent: parseFloat(d.sweet_spot_percent),
  swing_percent: parseFloat(d.swing_percent),
  walk: parseFloat(d.walk),
  whiff_percent: parseFloat(d.whiff_percent),
  woba: parseFloat(d.woba),
  xba: parseFloat(d.xba),
  xobp: parseFloat(d.xobp),
  xslg: parseFloat(d.xslg),
  xwoba: parseFloat(d.xwoba),
  n_outs_above_average: parseFloat(d.n_outs_above_average),
  rel_league_reaction_dsitance: parseFloat(d.rel_league_reaction_dsitance),
  rel_league_burst_distnce: parseFloat(d.rel_league_burst_distnce),
  sprint_speed: parseFloat(d.sprint_speed),
}));

update();

function update() {
  const t = 1000;
  const currentData = data.filter(
    (d) => !isNaN(d[xVar]) && !isNaN(d[yVar])
  );

  svg.selectAll(".axis").remove();
  svg.selectAll(".labels").remove();

  xScale = d3
    .scaleLinear()
    .domain([
      Math.min(
        0,
        d3.min(currentData, (d) => d[xVar])
      ),
      d3.max(currentData, (d) => d[xVar]),
    ])
    .range([0, width]);
  const xAxis = d3.axisBottom(xScale);
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  yScale = d3
    .scaleLinear()
    .domain([
      Math.min(
        0,
        d3.min(currentData, (d) => d[yVar])
      ),
      d3.max(currentData, (d) => d[yVar]),
    ])
    .range([height, 0]);
  const yAxis = d3.axisLeft(yScale);
  svg.append("g").attr("class", "axis").call(yAxis);

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 20)
    .attr("text-anchor", "middle")
    .text(options[xVar])
    .attr("class", "labels");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 40)
    .attr("text-anchor", "middle")
    .text(options[yVar])
    .attr("class", "labels");

    const colors = (x) => { // change these eventually
      return "#000000"; 
    };



    svg
    .selectAll(".points")
    .data(currentData, (d) => d)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("class", "points")
          .attr("cx", (d) => xScale(d[xVar]))
          .attr("cy", (d) => yScale(d[yVar]))
          .style("fill", (d) => colors(d.batting_average))
          .style("opacity", 0.5)
          .style("stroke", "black")
          .style("stroke-width", "0")
          .on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("display", "block")
              .html(
                `<p>Haiii</p>`
              )
              .style("left", event.pageX + 20 + "px")
              .style("top", event.pageY - 28 + "px");
            d3.select(this)
              .style("strong", "black")
              .style("stroke-width", "4px");
          })
          .on("mouseout", function (event, d) {
            d3.select("#tooltip").style("display", "none");
            d3.select(this).style("stroke", "none");
          })
          .attr("r", 0)
          .transition(t)
          .attr("r", 5),
      (update) =>
        update
          .transition(t)
          .attr("cx", (d) => xScale(d[xVar]))
          .attr("cy", (d) => yScale(d[yVar]))
          .attr("r", 5)
          .style("fill", (d) => colors(d.batting_average)),
      (exit) => exit.transition(t).attr("r", 0).remove()
    );



  }

// async function init() {
//   d3.csv("./data/stats.csv").then((data) => {
//     const sortedCols = data.columns.slice().sort((a, b) => a.localeCompare(b));
//     console.log(sortedCols);
//   });
// }

// window.addEventListener("load", init);
