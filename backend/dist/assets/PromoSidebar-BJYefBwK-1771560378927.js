import{ak as h,r,j as o,c as g}from"./index-D-i0repk-1771560378927.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=h("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);function m(){const[a,n]=r.useState([]),[l,c]=r.useState(0),i="/api/logo/download/";return r.useEffect(()=>{(async()=>{try{const e=await g.get("/api/slideShow/getAll");e.data&&n(e.data.map(s=>({url:`${i}${s.image}`,altText:s.altText||"Slideshow Image",title:s.title||s.altText||"Slideshow Image"})))}catch(e){console.error("Error fetching slideshow images:",e)}})()},[]),r.useEffect(()=>{if(a.length>0){const t=setInterval(()=>{c(e=>(e+1)%a.length)},3e3);return()=>clearInterval(t)}},[l,a.length]),o.jsx("div",{className:"w-62 relative h-[55vh] overflow-hidden",children:a.length>0?a.map((t,e)=>o.jsx("img",{src:t.url,alt:t.altText,title:t.title,className:`w-full h-full absolute object-cover transition-opacity duration-1000 ease-in-out ${e===l?"opacity-100":"opacity-0"}`},e)):o.jsx("p",{className:"text-center text-gray-500",children:"Loading images..."})})}export{d as M,m as P};
