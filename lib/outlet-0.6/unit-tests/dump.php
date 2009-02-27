<?php
$pdo = new PDO('sqlite:test.sq3');
$pdo->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );

echo "### PROJECTS ### \n";
$stmt = $pdo->prepare("SELECT * FROM projects");
$stmt->execute();
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

var_dump($res);

$stmt = $pdo->prepare("SELECT 2+2");

$stmt->execute();
$res = $stmt->fetchAll(PDO::FETCH_ASSOC);

var_dump($res);
