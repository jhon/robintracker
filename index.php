<?php
require_once "config.php";

$start_time = explode(' ',microtime());
$start_time = $start_time[0] + $start_time[1];

$data = $database->query("SELECT * FROM (SELECT * FROM `track` WHERE `count`>100 AND `time`>(UNIX_TIMESTAMP()-60) AND `guid`!='' ORDER BY `id` DESC) as T GROUP BY `guid` ORDER BY `count` DESC")->fetchAll();
?>
<html>
<head>
<title>RobinTracker</title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
<meta http-equiv="refresh" content="60;">
</head>
<body>
<h1>Robin Tracker</h1>

<table class='table table-striped'>
<thead><tr>
<td><b>Room</b></td>
<td><b>Total</b></td>
<td><b>Grow</b></td>
<td><b>Stay</b></td>
<td><b>Abandon</b></td>
<td><b>Abstains</b></td>
<td><b>Founded</b></td>
<td><b>Reaping</b></td>
<td><b>Updated</b></td>
</tr></thead>

<?php
function prettyDeltaTime($reference)
{
	$reference = intval($reference);
	$time = time();
	$dt = abs($reference - $time);

	$minutes = floor(($dt - ($hours*60))/60);
	$seconds = $dt - (($minutes + ($hours*60)) * 60);

	return $minutes . "m" . $seconds . "s " . (($reference > $time)?"from now":"ago");
}
?>

<tbody>
<?php
$totalUsers = 0;
$totalGrow = 0;
$totalAbandon = 0;
$totalAbstains = 0;
?>

<?foreach($data as $row):?>
<?php
$totalUsers += $row['count'];
$totalGrow += $row['grow'];
$totalStay += $row['stay'];
$totalAbandon += $row['abandon'];
$totalAbstain += $row['novote'];
?>
<tr>
<!--<?=$row['guid']?>-->
<td><?=$row['room']?></td>
<td><?=$row['count']?></td>
<td><?=$row['grow']?></td>
<td><?=$row['stay']?></td>
<td><?=$row['abandon']?></td>
<td><?=$row['novote']?></td>
<td><?=prettyDeltaTime($row['formation']);?></td>
<td><?=prettyDeltaTime($row['reap']);?></td>
<td><?=prettyDeltaTime($row['time']);?></td>
</td>
<?endforeach;?>
<tr>
<td><b>Table Sum</b></td>
<td><?=$totalUsers?></td>
<td><?=$totalGrow?></td>
<td><?=$totalStay?></td>
<td><?=$totalAbandon?></td>
<td><?=$totalAbstain?></td>
<td/>
<td/>
<td/>
</tr>
</tbody>
</table>
<a href='https://github.com/jhon/robintracker'>Fork me on GitHub</a> | 
<a href='https://github.com/keythkatz/Robin-Autovoter'>Robin Autovote Script</a><br />
<?php
$data = $database->query("SELECT COUNT(`id`) as `count`, COUNT(DISTINCT `guid`) as `rooms` FROM `track` WHERE `time`>(UNIX_TIMESTAMP()-60)")->fetchAll();
$ppm = $data[0]['count'];
$rooms = $data[0]['rooms'];
?>
<?=$ppm?> updates for <?=$rooms?> rooms in the last minute.<br />
<?php
$end_time = explode(' ',microtime());
$total_time = ($end_time[0] + $end_time[1]) - $start_time;
printf("Generated in %.3fs",$total_time);
?>

<!-- Shoutout to the Romanian (or person tunneling through Romania). <3 Without you this service wouldn't be anywhere near as good as it is today you wonderful pain in the ass -->

<?=@$footer?>
</body>
 </html>
