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
    records per at-bat. Does not incude walks and hit-by-pitches).
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
  * xobp --> Expected On-base Average based on the quality of contact, and the player's speed.
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
const player_margin = { top: 60, right: 60, bottom: 60, left: 60 };
const player_width = 360 - player_margin.left - player_margin.right;
const player_height = 600 - player_margin.top - player_margin.bottom;
const player_center = { x: player_width / 2, y: player_height / 2 + 40 };

const whitespacesvg = d3
  .select("#vis")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const zoom = d3
  .zoom()
  .scaleExtent([0.5, 5])
  .extent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom],
  ]) // supposed to cut it off but ??
  .on("zoom", zoomin);

const svg = whitespacesvg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`)
  .call(zoom);

svg
  .append("rect")
  .attr("fill", "#0000")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("transform", `translate(${-margin.left},${-margin.top})`);

const player = d3
  .select("#player")
  .append("svg")
  .attr("width", player_width + player_margin.left + player_margin.right)
  .attr("height", player_height + player_margin.top + player_margin.bottom)
  .append("g")
  .attr("transform", `translate(${player_margin.left},${player_margin.top})`);

let xVar = "batting_average";
let yVar = "home_run";
let xScale;
let yScale;
let xAxis;
let yAxis;
let pinned_player = null;

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
  launch_angle_average: "Launch Angle Average",
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
  rel_league_reaction_distance: "Reaction Distance (ft)",
  rel_league_burst_distance: "Burst Distance (ft)",
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

svg.on("click", () => {
  pinned_player = null;
  showPlayer(null);
  d3.selectAll(".points").attr("r", 5).style("stroke", "none");
});

const data = await d3.csv("data/stats.csv", (d) => ({
  name: d["last_name, first_name"],
  player_id: d.player_id,
  ab: parseFloat(d.ab),
  avg_best_speed: parseFloat(d.avg_best_speed),
  avg_hyper_speed: parseFloat(d.avg_hyper_speed),
  barrel: parseFloat(d.barrel),
  barrel_batted_rate: parseFloat(d.barrel_batted_rate),
  batting_average: parseFloat(d.batting_avg),
  bb_percent: parseFloat(d.bb_percent),
  exit_velocity_avg: parseFloat(d.exit_velocity_avg),
  hard_hit_percentage: parseFloat(d.hard_hit_percent),
  hit: parseFloat(d.hit),
  home_run: parseFloat(d.home_run),
  k_percent: parseFloat(d.k_percent),
  launch_angle_average: parseFloat(d.launch_angle_avg),
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
  rel_league_reaction_distance: parseFloat(d.rel_league_reaction_distance),
  rel_league_burst_distance: parseFloat(d.rel_league_burst_distance),
  sprint_speed: parseFloat(d.sprint_speed),
}));

const maxExitVelo = d3.max(data, (d) => d.exit_velocity_avg);
const [minLA, maxLA] = d3.extent(data, (d) => d.launch_angle_average);
const laScale = d3.scaleLinear().domain([minLA, maxLA]).range([0, 1]);

const leagueStats = {
  hrRate: d3.mean(data, (d) => d.home_run / d.hit),
  kAvoidanceRate: d3.mean(data, (d) => 1 - d.k_percent / 100),
  slgRate: d3.mean(data, (d) => d.slg_percent),
  xSlgRate: d3.mean(data, (d) => d.xslg),
  exit_velo_avg: d3.mean(data, (d) => d.exit_velocity_avg / maxExitVelo),
  battedBarrelRate: d3.mean(data, (d) => d.barrel_batted_rate / 100),
  whiff_perc: d3.mean(data, (d) => 1 - d.whiff_percent / 100),
  hardHitPerc: d3.mean(data, (d) => d.hard_hit_percentage / 100),
  launchAngleAvg: d3.mean(data, (d) => laScale(d.launch_angle_average)),
  ba: d3.mean(data, (d) => d.batting_average),
  xBA: d3.mean(data, (d) => d.xba),
  on_base_percent: d3.mean(data, (d) => d.on_base_percent),
  xobp: d3.mean(data, (d) => d.xobp),
  xwoba: d3.mean(data, (d) => d.xwoba),
  woba: d3.mean(data, (d) => d.woba),
  walk_rate: d3.mean(data, (d) => d.bb_percent / 100),
  obpPlusSlug: d3.mean(data, (d) => d.on_base_plus_slg),
  walksMinusHits: d3.mean(data, (d) => d.on_base_percent - d.batting_average),
};

// The talend of a player vs the average player
function pctAbove(val, mean) {
  return val / mean - 1;
}

function powerHitterFocus(d) {
  const hrRate = d.home_run / d.hit; // hr / hits
  const kAvoidanceRate = 1 - d.k_percent / 100; // 1 - k_percent
  const slgRate = d.slg_percent; // slg_percent
  const xSlgRate = d.xslg; //  slg_percent
  const exit_velo_avg = d.exit_velocity_avg / maxExitVelo; // exit_velocity_avg / max exit_velocity_avg
  const battedBarrelRate = d.barrel_batted_rate / 100; // barrel_batted_rate
  const launchAngleAvg = laScale(d.launch_angle_average);
  const hardHitPerc = d.hard_hit_percentage / 100;

  if (
    d.name == "Gallo, Joey" ||
    d.name == "Judge, Aaron" ||
    d.name == "Arraez, Luis"
  ) {
    console.log(`${d.name}:
  battedBarrelRate: ${battedBarrelRate} | pctAboveLeague: ${pctAbove(
    battedBarrelRate,
    leagueStats.battedBarrelRate,
  )}
  hrRate: ${hrRate} | pctAboveLeague: ${pctAbove(hrRate, leagueStats.hrRate)}
  kAvoidanceRate: ${kAvoidanceRate} | pctAboveLeague: ${pctAbove(
    kAvoidanceRate,
    leagueStats.kAvoidanceRate,
  )}
  exit_velo_avg: ${exit_velo_avg} | pctAboveLeague: ${pctAbove(
    exit_velo_avg,
    leagueStats.exit_velo_avg,
  )}
  xSlgRate: ${xSlgRate} | pctAboveLeague: ${pctAbove(
    xSlgRate,
    leagueStats.xSlgRate,
  )}
  slgRate: ${slgRate} | pctAboveLeague: ${pctAbove(
    slgRate,
    leagueStats.slgRate,
  )}
  launchAngleAvg: ${launchAngleAvg} | pctAboveLeague: ${pctAbove(
    launchAngleAvg,
    leagueStats.launchAngleAvg,
  )}
  hardHitPerc: ${hardHitPerc} | pctAboveLeague: ${pctAbove(
    hardHitPerc,
    leagueStats.hardHitPerc,
  )}`);
  }
  return (
    // SKILL RATING WITH NO DEFENSIVE IMPACT (0.10)
    0.1 * pctAbove(kAvoidanceRate, leagueStats.kAvoidanceRate) +
    // POWER SKILLS (0.9)
    0.25 * pctAbove(exit_velo_avg, leagueStats.exit_velo_avg) +
    0.15 * pctAbove(hardHitPerc, leagueStats.hardHitPerc) +
    0.15 * pctAbove(launchAngleAvg, leagueStats.launchAngleAvg) +
    0.12 * pctAbove(xSlgRate, leagueStats.xSlgRate) +
    0.12 * pctAbove(hrRate, leagueStats.hrRate) +
    0.1 * pctAbove(battedBarrelRate, leagueStats.battedBarrelRate)
  );
}

function contactHitterFocus(d) {
  const ba = d.batting_average; // Batting Average
  const xBA = d.xba; // Expected Batting Average
  const obp = d.on_base_percent; // obp
  const xobp = d.xobp; // xobp
  const xwoba = d.xwoba; // xwoba
  const woba = d.woba; // woba
  const kAvoidanceRate = 1 - d.k_percent / 100; // 1 - k_percent
  return (
    // SKILL WITH NO DEFENSIVE IMPACT (0.05)
    0.05 * pctAbove(kAvoidanceRate, leagueStats.kAvoidanceRate) +
    // OUTCOME (0.30)
    0.15 * pctAbove(ba, leagueStats.ba) +
    0.1 * pctAbove(obp, leagueStats.on_base_percent) +
    0.05 * pctAbove(woba, leagueStats.woba) +
    // EXPECTED OUTCOMES (0.65)
    0.35 * pctAbove(xBA, leagueStats.xBA) +
    0.25 * pctAbove(xobp, leagueStats.xobp) +
    0.05 * pctAbove(xwoba, leagueStats.xwoba)
  );
}

function plateDisciplineFocus(d) {
  const kAvoidanceRate = 1 - d.k_percent / 100;
  const walkRate = d.bb_percent / 100;
  const whiffRate = 1 - d.whiff_percent / 100;
  const walksMinusHits = d.on_base_percent - d.batting_average;

  return (
    0.4 * pctAbove(kAvoidanceRate, leagueStats.kAvoidanceRate) +
    0.4 * pctAbove(walkRate, leagueStats.walk_rate) +
    0.25 * pctAbove(whiffRate, leagueStats.whiff_perc) +
    0.05 * pctAbove(walksMinusHits, leagueStats.walksMinusHits)
  );
}
data.forEach((d) => {
  d.powerRaw = powerHitterFocus(d);
  d.contactRaw = contactHitterFocus(d);
  d.plateDisciplineRaw = plateDisciplineFocus(d);
});

const [minContactRaw, maxContactRaw] = d3.extent(data, (d) => d.contactRaw);
const [minPowerRaw, maxPowerRaw] = d3.extent(data, (d) => d.powerRaw);
const [minPlateDisciplineRaw, maxPlateDisciplineRaw] = d3.extent(
  data,
  (d) => d.plateDisciplineRaw,
);

const powerScale = d3
  .scaleLinear()
  .domain([minPowerRaw, maxPowerRaw])
  .range([0, 1])
  .clamp(true);

const contactScale = d3
  .scaleLinear()
  .domain([minContactRaw, maxContactRaw])
  .range([0, 1]);

const plateDisciplineScale = d3
  .scaleLinear()
  .domain([minPlateDisciplineRaw, maxPlateDisciplineRaw])
  .range([0, 1]);

data.forEach((d) => {
  d.powerScore = powerScale(d.powerRaw);
  d.contactScore = contactScale(d.contactRaw);
  d.plateDisciplineScore = plateDisciplineScale(d.plateDisciplineRaw);
});
console.table(
  data
    .sort((a, b) => b.plateDisciplineScore - a.plateDisciplineScore)
    .map((d) => ({
      NAME: d.name,
      plateDisciplineScore: +d.plateDisciplineScore,
    })),
);
update();

function zoomin(ev) {
  svg.select(".x.axis").call(xAxis.scale(ev.transform.rescaleX(xScale)));
  svg.select(".y.axis").call(yAxis.scale(ev.transform.rescaleY(yScale)));
  svg
    .selectAll(".points")
    .attr("cx", (e) => ev.transform.rescaleX(xScale)(e[xVar]))
    .attr("cy", (e) => ev.transform.rescaleY(yScale)(e[yVar]));
}

function isPinned(d) {
  return d.player_id === pinned_player?.player_id;
}

function stroke(d) {
  return isPinned(d) ? "red" : "none";
}

function update() {
  console.log(data);
  const t = 1000;

  const currentData = data.filter((d) => !isNaN(d[xVar]) && !isNaN(d[yVar]));

  svg.selectAll(".axis").remove();
  svg.selectAll(".labels").remove();

  xScale = d3
    .scaleLinear()
    .domain([
      Math.min(
        0,
        d3.min(currentData, (d) => d[xVar]),
      ),
      d3.max(currentData, (d) => d[xVar]),
    ])
    .range([0, width]);
  xAxis = d3.axisBottom(xScale);
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  yScale = d3
    .scaleLinear()
    .domain([
      Math.min(
        0,
        d3.min(currentData, (d) => d[yVar]),
      ),
      d3.max(currentData, (d) => d[yVar]),
    ])
    .range([height, 0]);
  yAxis = d3.axisLeft(yScale);
  svg.append("g").attr("class", "y axis").call(yAxis);

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

  const colors = (x) => {
    // change these eventually
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
          // .style("fill", (d) => colors(d.batting_average))
          .style("opacity", 0.5)
          .style("stroke", stroke)
          .style("stroke-width", "2")
          .on("mouseover", function (event, d) {
            d3.select("#tooltip")
              .style("display", "block")
              .html(
                `<p><b>${d.name}</b></p>
                 <p>${options[xVar]}: ${d[xVar]}</p>
                 <p>${options[yVar]}: ${d[yVar]}</p>`,
              )
              .style("left", event.pageX + 20 + "px")
              .style("top", event.pageY - 28 + "px");
            d3.select(this).attr("r", isPinned(d) ? 8 : 7);
            showPlayer(d);
          })
          .on("mouseout", function (event, d) {
            d3.select("#tooltip").style("display", "none");
            d3.select(this).attr("r", isPinned(d) ? 6 : 5);
            showPlayer(pinned_player);
          })
          .on("click", function (event, d) {
            event.stopPropagation();
            if (isPinned(d)) {
              pinned_player = null;
              d3.select(this).attr("r", 7).style("stroke", "none");
            } else {
              pinned_player = d;
              d3.selectAll(".points")
                .attr("r", (d) => (isPinned(d) ? 8 : 5))
                .style("stroke", stroke);
            }
          })
          .attr("r", 0)
          .transition(t)
          .attr("r", 5),
      (update) => {
        update
          .transition(t)
          .attr("cx", (d) => xScale(d[xVar]))
          .attr("cy", (d) => yScale(d[yVar]))
          .attr("r", 5);
        // .style("fill", (d) => colors(d.batting_average));
        svg.call(zoom.transform, d3.zoomIdentity);
      },
      (exit) => exit.transition(t).attr("r", 0).remove(),
    );

  showPlayer(pinned_player);
}

function showPlayer(d) {
  player.selectAll(".player").remove();

  player
    .append("text")
    .attr("x", player_width / 2)
    .attr("y", player_margin.top - 20)
    .attr("text-anchor", "middle")
    .text(d?.name ?? "Hover over a player")
    .attr("class", "player");

  const features = ["Plate Discipline", "Power Hitter", "Contact Hitter"];

  let radialScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, player_width / 2]);

  let ticks = [0.25, 0.5, 0.75, 1];

  ticks.forEach((t) =>
    player
      .append("circle")
      .attr("cx", player_center.x)
      .attr("cy", player_center.y)
      .attr("fill", "none")
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", "2")
      .attr("r", radialScale(t))
      .attr("class", "player"),
  );

  ticks.forEach((t) =>
    player
      .append("text")
      .attr("x", player_center.x - 15)
      .attr("y", player_center.y - radialScale(t) - 5)
      .attr("fill", "#bbbbbb")
      .attr("font-size", "10px")
      .text(t.toString())
      .attr("class", "player"),
  );

  function angleToCoordinate(angle, value) {
    let x = player_center.x + Math.cos(angle) * radialScale(value);
    let y = player_center.y + Math.sin(angle) * radialScale(value);
    return { x, y };
  }

  for (var i = 0; i < features.length; i++) {
    let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
    let line_coordinate = angleToCoordinate(angle, 1);
    let label_coordinate = angleToCoordinate(angle, 1.2);

    // Axis Label
    player
      .append("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("x", label_coordinate.x)
      .attr("y", label_coordinate.y)
      .attr("font-size", "11px")
      .attr("fill", "#333333")
      .text(features[i])
      .attr("class", "player");

    // Axis Line
    player
      .append("line")
      .attr("x1", player_center.x)
      .attr("y1", player_center.y)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", "2")
      .attr("class", "player");
  }

  if (d == null) {
    return;
  }

  // https://observablehq.com/@huangshew/spider-chart/2

  // TODO
  const stats = {
    "Plate Discipline": d.plateDisciplineScore,
    "Power Hitter": d.powerScore,
    "Contact Hitter": d.contactScore,
  };
  const leagueAvgStats = {
    "Plate Discipline": d3.mean(data, (dd) => dd.plateDisciplineScore),
    "Power Hitter": d3.mean(data, (dd) => dd.powerScore),
    "Contact Hitter": d3.mean(data, (dd) => dd.contactScore),
  };
  function getPathCoordinates(data_point) {
    let coordinates = [];
    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }
  const leagueCoords = getPathCoordinates(leagueAvgStats);
  leagueCoords.forEach((pt) => {
    player
      .append("circle")
      .attr("class", "player")
      .attr("r", 3)
      .attr("fill", "#888")
      .attr("cx", pt.x)
      .attr("cy", pt.y);
  });

  player
    .append("path")
    .datum(leagueCoords)
    .attr("class", "player")
    .attr(
      "d",
      d3
        .line()
        .curve(d3.curveCatmullRomClosed)
        .x((p) => p.x)
        .y((p) => p.y),
    )
    .attr("stroke", "#bbb")
    .attr("stroke-width", 2)
    .attr("fill", "white")
    .attr("fill-opacity", 0.2);

  const coords = getPathCoordinates(stats);

  coords.forEach((d) => {
    player
      .append("circle")
      .attr("r", 4)
      .attr("fill", "#af2d2d")
      .attr("cx", d.x)
      .attr("cy", d.y)
      .attr("class", "player");
  });

  var lg = player
    .append("defs")
    .append("linearGradient")
    .attr("id", "mygrad")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%")
    .attr("class", "player");

  lg.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "#ce6262")
    .style("stop-opacity", 0)
    .attr("class", "player");

  lg.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#ce6262")
    .style("stop-opacity", 0.5)
    .attr("class", "player");

  player
    .append("path")
    .datum([...coords])
    .attr(
      "d",
      d3
        .line()
        .curve(d3.curveCatmullRomClosed)
        .x((d) => d.x)
        .y((d) => d.y),
    )
    .attr("stroke-width", 4)
    .attr("stroke", "#f05454")
    .attr("fill", "#f05454")
    .attr("stroke-opacity", 1)
    .attr("opacity", 0.5)
    .attr("class", "player");
}

// async function init() {
//   d3.csv("./data/stats.csv").then((data) => {
//     const sortedCols = data.columns.slice().sort((a, b) => a.localeCompare(b));
//     console.log(sortedCols);
//   });
// }

// window.addEventListener("load", init);
