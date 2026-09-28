#!/usr/bin/env node
import fs from "node:fs";

const file = "client/public/data/lessonQuizzes.json";
let source = fs.readFileSync(file, "utf8");
const repairs = [];

function replaceWithinQuestion(questionText, oldValue, newValue, label) {
  const start = source.indexOf(questionText);
  if (start < 0) throw new Error(`Question not found: ${questionText}`);
  const end = source.indexOf('"explanation":', start);
  if (end < 0) throw new Error(`Question boundary not found: ${questionText}`);
  const section = source.slice(start, end);
  if (section.includes(newValue)) return;
  const matches = section.split(oldValue).length - 1;
  if (matches !== 1) throw new Error(`Expected exactly one ${label} match, found ${matches}.`);
  source = `${source.slice(0, start)}${section.replace(oldValue, newValue)}${source.slice(end)}`;
  repairs.push(label);
}

replaceWithinQuestion(
  "In this quiz schema, what are the four choice identifiers used?",
  '"en": "A, B, C, D",\n              "fr": "A, B, C, D"',
  '"en": "Descriptive identifiers: choice_1, choice_2, choice_3, choice_4",\n              "fr": "Des identifiants descriptifs : choice_1, choice_2, choice_3, choice_4"',
  "architect_foundations_03.12_1.question_5.choice_d",
);

replaceWithinQuestion(
  "In this quiz format, which IDs are used for the answer choices?",
  '"en": "A, B, C, D",\n              "fr": "A, B, C, D"',
  '"en": "Descriptive identifiers: option_1, option_2, option_3, option_4",\n              "fr": "Des identifiants descriptifs : option_1, option_2, option_3, option_4"',
  "architect_foundations_06.3_0.question_12.choice_c",
);

replaceWithinQuestion(
  "Which statement best describes the MCP architecture in terms of communication?",
  '"id": "b",\n            "text": {\n              "en": "The MCP server only communicates with the browser.",\n              "fr": "Le serveur MCP ne communique qu\'avec le navigateur."\n            }\n          },\n          {\n            "id": "d",',
  '"id": "b",\n            "text": {\n              "en": "The MCP server only communicates with the browser.",\n              "fr": "Le serveur MCP ne communique qu\'avec le navigateur."\n            }\n          },\n          {\n            "id": "c",',
  "architect_foundations_07.5_0.question_10.choice_c_id",
);

fs.writeFileSync(file, source, "utf8");
console.log(JSON.stringify({ repaired: repairs.length, repairs }, null, 2));
