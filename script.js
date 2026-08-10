const metrics=[{name:"Accuracy",values:[75,67,80]},{name:"Macro F1",values:[51,56,64]},{name:"Impaired recall",values:[45,65,55]},{name:"ROC-AUC",values:[64,60,74]},{name:"PR-AUC",values:[41,39,49]}];
const chart=document.querySelector("#chart");
metrics.forEach(metric=>{const row=document.createElement("div");row.className="metric";row.innerHTML=`<strong>${metric.name}</strong><div class="bars">${metric.values.map(value=>`<i class="bar" style="width:${value}%"><em>${value}</em></i>`).join("")}</div>`;chart.appendChild(row)});
const menu=document.querySelector(".menu"),nav=document.querySelector(".nav");
menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open))});
document.querySelectorAll(".nav a").forEach(link=>link.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${entry.target.id}`))}}),{rootMargin:"-35% 0px -55%"});
document.querySelectorAll("section[id]").forEach(section=>observer.observe(section));
// End note: navigation and chart output checked against the visible poster sections.
