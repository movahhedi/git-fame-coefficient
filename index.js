#!/usr/bin/env node

import { execSync } from "child_process";
import prompt from "prompt";

console.log("Starting git-fame-coefficient...");

let Total_X = 0,
	Total_LOC = 0,
	Result = [],
	queries = [
		{
			command:
				'git fame --loc=surv -w -M -C -C --format=json -s --log=FATAL --incl="src/.*.(php|html|scss|css|js|ts|jsx|tsx)$"',
			x: 7,
		},
		{
			command:
				'git fame --loc=ins -w -M -C -C --format=json -s --log=FATAL --incl="src/.*.(php|html|scss|css|js|ts|jsx|tsx)$"',
			x: 5,
		},
		{
			command:
				'git fame --loc=del -w -M -C -C --format=json -s --log=FATAL --incl="src/.*.(php|html|scss|css|js|ts|jsx|tsx)$"',
			x: 1,
		},
	];

queries.forEach((query) => {
	console.log("Running: " + query.command);
	Total_X += query.x;
	let stdout = execSync(query.command);
	let data = JSON.parse(stdout.toString());
	data.data.forEach((i) => {
		let found = Result.findIndex((el) => el.name === i[0]);
		if (found > -1) {
			Result[found].loc += i[1] * query.x;
		} else {
			Result.push({
				name: i[0],
				loc: i[1] * query.x,
			});
		}
		Total_LOC += i[1] * query.x;
	});
});

Total_LOC /= Total_X;
Result.forEach((person) => {
	person.loc = (person.loc / Total_X).toFixed();
	person.loc_percent = +((person.loc / Total_LOC) * 100).toFixed(3);
});

Result.sort((a, b) => parseFloat(b.loc) - parseFloat(a.loc));

prompt.start();
prompt.get(["total_project_money", "gitfame_money_percent"], (err, result) => {
	if (err) return console.table(Result);

	if (result.total_project_money > 0) {
		let gitfame_money_percent = result.gitfame_money_percent > 0 ? result.gitfame_money_percent : 100,
			gitfame_money = (result.total_project_money * gitfame_money_percent) / 100;

		Result.forEach((person) => {
			person.money = ((gitfame_money * person.loc_percent) / 100).toFixed().toLocaleString(); // "en-US"
		});
	}

	console.table(Result);
});
