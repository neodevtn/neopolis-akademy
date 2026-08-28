import fs from "node:fs";
const path="client/public/data/courses/introduction_to_generative_ai_in_snowflake__01.json";
const course=JSON.parse(fs.readFileSync(path,"utf8"));
for(const lesson of course.lessons){lesson.chapters=lesson.chapters.filter(chapter=>chapter.sourceActivityType!=="CloudExercise");for(const chapter of lesson.chapters)for(const block of chapter.blocks||[]){for(const slide of block.projectorSlides||[block])for(const key of ["content","contentLeft","contentRight"]){if(typeof slide[key]==="string"&&/https?:\/\//.test(slide[key]))slide[key]="";}}}
course.exerciseCount=0;
fs.writeFileSync(path,JSON.stringify(course,null,2)+"\n");
console.log(JSON.stringify({activities:course.lessons.flatMap(l=>l.chapters).length,exerciseCount:course.exerciseCount}));
