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
  * xobp --> Expected On-base

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

async function init() {
  d3.csv("./data/stats.csv").then((data) => {
    const sortedCols = data.columns.slice().sort((a, b) => a.localeCompare(b));
    console.log(sortedCols);
  });
}

window.addEventListener("load", init);
