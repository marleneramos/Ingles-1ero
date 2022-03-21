<?php
//copy this from in csv format
$lastpage = 0;
$lastunit = '';
if (($handle = fopen($argv[1], "r")) !== FALSE) {
	fgetcsv($handle, 1000, ",");
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
			if (!$data[0]) continue;
			if ($data[0]=='Activity id') continue;
			if (preg_match('/(hf.)_(..)_(.+)_p0*([0-9]+)_.*/', $data[0], $matches)) {
				$hf = $matches[1];
				$pora = $matches[2];
				$unit = $matches[3];
				$page = intval($matches[4]);
			} else {
				echo 'no match for '. $data[0]. "\n";
				continue;
			}

			if ($unit != $lastunit) {
				$lastunit = $unit;
?>
"X": {
		"title": "<?=$unit?>",
		"page_contents": {
<?php }
if ($page != $lastpage) {
	if ($page % 2 == 0) {
		if ($lastpage != 0) { ?>
		]
	},
<?php } ?>
	"Y": {
		"title": "<?=$page?>-<?=$page+1?>",
		"data": '<img src="./images/<?=$hf?>-<?=$pora?>-<?=$page?>.jpg"><img src="./images/<?=$hf?>-<?=$pora?>-<?=$page+1?>.jpg">',
		"epv": [
<?php }
	
	$lastpage = $page;
}?>
			{//<?=$data[0]?>

				"hotspot": [<?php if ($page % 2 == 0) { ?>0,0,0<?php }else{ ?>leftpagewidth + 0, 0, leftpagewidth + 0<?php } ?>,0],
				"assets": [
<?php if (($data[5])) { ?>
					{
						"type": "audio",
						"file": "./audio/<?=$data[5]?>.mp3"
					},
<?php } if (($data[8])) { ?>
					{
						"type": "video",
						"file": "./video/<?=@$data[8]?>"
					},
<?php } if (($data[4])) { ?>
					{
						"type": "answers",
						"title": "",
						"content": ['<?= @join('\',\'', explode("\n", $data[4]))?>']
					},
<?php } if (($data[7])) { ?>
					{
						"type": "tips",
						"content": "<?=join('<br />',explode("\n",$data[7]))?>"
					},
<?php } if (($data[13])) { ?>
					{
						"type": "interactive",
						"title": "Dialog Builder",
						"url": "./dialogbuilder/dialogbuilder.html",
						"id": "<?=@$data[0]?>"
					}
<?php }?>
/* <?=@$data[9]?> <?=@$data[10]?> <?=@$data[11]?> <?=@$data[12]?> */
/* <?=@$data[14]?> */
				]
			},

<?php
				
		}
    fclose($handle);
}?>
			
			]
		}
	}
},
// end of <?=$unit?>
