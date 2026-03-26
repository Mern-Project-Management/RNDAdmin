import{f as U,dW as c,r as a,h as i,dv as r,j as t,dk as m,L as B,az as V,bl as A}from"./index-D3Il_KXh-1774512681964.js";const Q=()=>{U();const[n]=c.useForm(),[d,u]=a.useState(""),[b,k]=a.useState(!0),[f,v]=a.useState(!1),[C,w]=a.useState(null),[h,p]=a.useState(""),[x,q]=a.useState(""),[s,y]=a.useState(""),[g,j]=a.useState(""),[F,N]=a.useState(""),T=a.useMemo(()=>({toolbar:[[{header:[1,2,3,4,5,6,!1]}],[{font:[]}],[{size:[]}],["bold","italic","underline","strike","blockquote"],[{list:"ordered"},{list:"bullet"},{indent:"-1"},{indent:"+1"}],["link","image","video"],[{align:[]}],[{color:[]},{background:[]}],["clean"]],clipboard:{matchVisual:!1}}),[]),S=["header","font","size","bold","italic","underline","strike","blockquote","list","bullet","indent","link","image","video","align","color","background"];a.useEffect(()=>{(async()=>{try{const o=await i.get("/api/terms");if(o.data.length>0){const l=o.data[0];u(l.termsCondition),w(l._id),n.setFieldsValue({termsCondition:l.termsCondition}),v(!0)}}catch{r.error("Failed to fetch terms and conditions data")}finally{k(!1)}})(),I()},[]);const I=async()=>{try{const e=await i.get("/api/pageHeading/heading?pageType=terms-condition"),{heading:o,subheading:l,photo:P,alt:L,imgTitle:R}=e.data;p(o||""),q(l||""),y(P||""),j(L||""),N(R||"")}catch(e){console.error("Failed to fetch headings:",e),r.error("Failed to load page headings")}},E=e=>{(!e||e==="<p><br></p>")&&d&&d!=="<p><br></p>"||(u(e),n.setFieldsValue({termsCondition:e}))},H=async()=>{try{const e=n.getFieldValue("termsCondition")||d,o={termsCondition:e};if(!e||e.replace(/<[^>]*>/g,"").trim()===""){r.error("Terms and conditions content cannot be empty");return}f?(await i.put(`/api/terms/${C}`,o),r.success("Terms and conditions updated successfully")):(await i.post("/api/terms/add",o),r.success("Terms and conditions created successfully"))}catch(e){r.error("Failed to save terms and conditions"),console.error("Error:",e)}},z=async()=>{const e=new FormData;e.append("heading",h),e.append("subheading",x),e.append("alt",g),e.append("imgTitle",F),s instanceof File&&e.append("photo",s);try{await i.put("/api/pageHeading/updateHeading?pageType=terms-condition",e,{withCredentials:!0}),r.success("Page heading updated successfully!")}catch(o){console.error("Failed to update page heading:",o),r.error("Failed to update page heading")}},D=e=>{y(e.target.files[0])};return t.jsxs(t.Fragment,{children:[t.jsxs(m,{className:"mb-4",children:[t.jsx(m.Item,{children:t.jsx(B,{to:"/dashboard",children:"Dashboard"})}),t.jsx(m.Item,{children:"Terms and Conditions Form"})]}),t.jsxs("div",{className:"mb-8 border border-gray-200 shadow-lg p-4 rounded ",children:[t.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Edit Page Heading"}),t.jsxs("div",{className:"grid md:grid-cols-2 md:gap-6 grid-cols-1",children:[t.jsxs("div",{className:"mb-6",children:[t.jsx("label",{className:"block text-gray-700 font-bold mb-2 uppercase font-serif",children:"Heading"}),t.jsx("input",{type:"text",value:h,onChange:e=>p(e.target.value),className:"w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"})]}),t.jsxs("div",{className:"mb-6",children:[t.jsx("label",{className:"block text-gray-700 font-bold mb-2 uppercase font-serif",children:"Sub heading"}),t.jsx("input",{type:"text",value:x,onChange:e=>q(e.target.value),className:"w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"})]}),t.jsxs("div",{className:"mb-6",children:[t.jsx("label",{className:"block text-gray-700 font-bold mb-2 uppercase font-serif",children:"Upload Image"}),t.jsx("input",{type:"file",onChange:D,className:"w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"}),s&&t.jsx("div",{className:"mt-2",children:t.jsx("img",{src:s instanceof File?URL.createObjectURL(s):`/api/logo/download/${s}`,alt:g,className:"w-32 h-32 object-cover rounded"})})]}),t.jsxs("div",{className:"mb-6",children:[t.jsx("label",{className:"block text-gray-700 font-bold mb-2 uppercase font-serif",children:"Alt Text"}),t.jsx("input",{type:"text",value:g,onChange:e=>j(e.target.value),className:"w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"})]})]}),t.jsx("button",{onClick:z,className:"px-4 py-2 bg-[#ffcc00] text-[#1a1a1a] rounded hover:bg-[#e6b800] transition duration-300 font-serif",children:"Save Headings"})]}),t.jsxs(c,{form:n,layout:"vertical",onFinish:H,children:[t.jsx(c.Item,{name:"termsCondition",label:"Terms and Conditions",rules:[{required:!0,message:"Please enter the terms and conditions"},{validator:(e,o)=>{const l=o==null?void 0:o.replace(/<[^>]*>/g,"").trim();return!l||l===""?Promise.reject("Please enter the terms and conditions"):Promise.resolve()}}],children:t.jsx(V,{theme:"snow",value:d,onChange:E,modules:T,formats:S,placeholder:"Start typing your terms and conditions...",style:{height:"400px",marginBottom:"50px"}})}),t.jsxs(c.Item,{children:[t.jsx(A,{type:"primary",htmlType:"submit",loading:b,disabled:b,children:f?"Update":"Save"}),b&&t.jsx("span",{className:"ml-3 text-gray-500 text-sm",children:"Loading data..."})]})]}),t.jsx("style",{jsx:!0,children:`
        /* Quill Editor Customization */
        :global(.ql-container) {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
        }

        :global(.ql-toolbar) {
          background-color: #fafafa;
          border: 1px solid #d9d9d9;
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }

        :global(.ql-container.ql-snow) {
          border: 1px solid #d9d9d9;
          border-radius: 0 0 6px 6px;
        }

        :global(.ql-editor) {
          min-height: 400px;
          font-size: 16px;
          line-height: 1.6;
        }

        :global(.ql-editor.ql-blank::before) {
          color: #bfbfbf;
          font-style: normal;
        }

        /* Toolbar button hover effects */
        :global(.ql-toolbar button:hover),
        :global(.ql-toolbar button:focus) {
          color: #1890ff;
        }

        :global(.ql-toolbar button.ql-active) {
          color: #1890ff;
        }

        :global(.ql-toolbar .ql-stroke) {
          stroke: #595959;
        }

        :global(.ql-toolbar button:hover .ql-stroke),
        :global(.ql-toolbar button:focus .ql-stroke),
        :global(.ql-toolbar button.ql-active .ql-stroke) {
          stroke: #1890ff;
        }

        :global(.ql-toolbar .ql-fill) {
          fill: #595959;
        }

        :global(.ql-toolbar button:hover .ql-fill),
        :global(.ql-toolbar button:focus .ql-fill),
        :global(.ql-toolbar button.ql-active .ql-fill) {
          fill: #1890ff;
        }

        /* Picker hover effects */
        :global(.ql-toolbar .ql-picker-label:hover),
        :global(.ql-toolbar .ql-picker-item:hover) {
          color: #1890ff;
        }

        /* Editor content styling */
        :global(.ql-editor h1) {
          font-size: 2em;
          font-weight: 700;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h2) {
          font-size: 1.5em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor h3) {
          font-size: 1.25em;
          font-weight: 600;
          margin-bottom: 0.5em;
        }

        :global(.ql-editor p) {
          margin-bottom: 1em;
        }

        :global(.ql-editor ul),
        :global(.ql-editor ol) {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        :global(.ql-editor blockquote) {
          border-left: 4px solid #1890ff;
          padding-left: 16px;
          margin: 1em 0;
          font-style: italic;
          color: #595959;
        }

        :global(.ql-editor a) {
          color: #1890ff;
          text-decoration: underline;
        }

        :global(.ql-editor a:hover) {
          color: #40a9ff;
        }

        :global(.ql-editor img) {
          max-width: 100%;
          height: auto;
        }

        /* Focus state */
        :global(.ql-container.ql-snow:focus-within) {
          border-color: #40a9ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }

        /* Scrollbar styling */
        :global(.ql-editor::-webkit-scrollbar) {
          width: 8px;
        }

        :global(.ql-editor::-webkit-scrollbar-track) {
          background: #f1f1f1;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb) {
          background: #d9d9d9;
          border-radius: 4px;
        }

        :global(.ql-editor::-webkit-scrollbar-thumb:hover) {
          background: #bfbfbf;
        }
      `})]})};export{Q as default};
