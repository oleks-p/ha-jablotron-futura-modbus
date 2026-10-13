/* Jablotron Futura Lovelace cards - generated, do not edit */
var ee=globalThis,ie=ee.ShadowRoot&&(ee.ShadyCSS===void 0||ee.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Re=Symbol(),ti=new WeakMap,Ut=class{constructor(i,t,e){if(this._$cssResult$=!0,e!==Re)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=t}get styleSheet(){let i=this.o,t=this.t;if(ie&&i===void 0){let e=t!==void 0&&t.length===1;e&&(i=ti.get(t)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),e&&ti.set(t,i))}return i}toString(){return this.cssText}},re=s=>new Ut(typeof s=="string"?s:s+"",void 0,Re),A=(s,...i)=>{let t=s.length===1?s[0]:i.reduce((e,r,n)=>e+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Ut(t,s,Re)},ei=(s,i)=>{if(ie)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of i){let e=document.createElement("style"),r=ee.litNonce;r!==void 0&&e.setAttribute("nonce",r),e.textContent=t.cssText,s.appendChild(e)}},Me=ie?s=>s:s=>s instanceof CSSStyleSheet?(i=>{let t="";for(let e of i.cssRules)t+=e.cssText;return re(t)})(s):s;var{is:Ki,defineProperty:Xi,getOwnPropertyDescriptor:qi,getOwnPropertyNames:Yi,getOwnPropertySymbols:Zi,getPrototypeOf:Ji}=Object,ne=globalThis,ii=ne.trustedTypes,Qi=ii?ii.emptyScript:"",tr=ne.reactiveElementPolyfillSupport,Ot=(s,i)=>s,Le={toAttribute(s,i){switch(i){case Boolean:s=s?Qi:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,i){let t=s;switch(i){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},ni=(s,i)=>!Ki(s,i),ri={attribute:!0,type:String,converter:Le,reflect:!1,useDefault:!1,hasChanged:ni};Symbol.metadata??=Symbol("metadata"),ne.litPropertyMetadata??=new WeakMap;var V=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,t=ri){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(i,t),!t.noAccessor){let e=Symbol(),r=this.getPropertyDescriptor(i,e,t);r!==void 0&&Xi(this.prototype,i,r)}}static getPropertyDescriptor(i,t,e){let{get:r,set:n}=qi(this.prototype,i)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){let o=r?.call(this);n?.call(this,a),this.requestUpdate(i,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??ri}static _$Ei(){if(this.hasOwnProperty(Ot("elementProperties")))return;let i=Ji(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(Ot("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ot("properties"))){let t=this.properties,e=[...Yi(t),...Zi(t)];for(let r of e)this.createProperty(r,t[r])}let i=this[Symbol.metadata];if(i!==null){let t=litPropertyMetadata.get(i);if(t!==void 0)for(let[e,r]of t)this.elementProperties.set(e,r)}this._$Eh=new Map;for(let[t,e]of this.elementProperties){let r=this._$Eu(t,e);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let t=[];if(Array.isArray(i)){let e=new Set(i.flat(1/0).reverse());for(let r of e)t.unshift(Me(r))}else i!==void 0&&t.push(Me(i));return t}static _$Eu(i,t){let e=t.attribute;return e===!1?void 0:typeof e=="string"?e:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,t=this.constructor.elementProperties;for(let e of t.keys())this.hasOwnProperty(e)&&(i.set(e,this[e]),delete this[e]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ei(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,t,e){this._$AK(i,e)}_$ET(i,t){let e=this.constructor.elementProperties.get(i),r=this.constructor._$Eu(i,e);if(r!==void 0&&e.reflect===!0){let n=(e.converter?.toAttribute!==void 0?e.converter:Le).toAttribute(t,e.type);this._$Em=i,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(i,t){let e=this.constructor,r=e._$Eh.get(i);if(r!==void 0&&this._$Em!==r){let n=e.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Le;this._$Em=r;let o=a.fromAttribute(t,n.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(i,t,e,r=!1,n){if(i!==void 0){let a=this.constructor;if(r===!1&&(n=this[i]),e??=a.getPropertyOptions(i),!((e.hasChanged??ni)(n,t)||e.useDefault&&e.reflect&&n===this._$Ej?.get(i)&&!this.hasAttribute(a._$Eu(i,e))))return;this.C(i,t,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,t,{useDefault:e,reflect:r,wrapped:n},a){e&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,a??t??this[i]),n!==!0||a!==void 0)||(this._$AL.has(i)||(this.hasUpdated||e||(t=void 0),this._$AL.set(i,t)),r===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[r,n]of e){let{wrapped:a}=n,o=this[r];a!==!0||this._$AL.has(r)||o===void 0||this.C(r,void 0,n,o)}}let i=!1,t=this._$AL;try{i=this.shouldUpdate(t),i?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(e){throw i=!1,this._$EM(),e}i&&this._$AE(t)}willUpdate(i){}_$AE(i){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(i){}firstUpdated(i){}};V.elementStyles=[],V.shadowRootOptions={mode:"open"},V[Ot("elementProperties")]=new Map,V[Ot("finalized")]=new Map,tr?.({ReactiveElement:V}),(ne.reactiveElementVersions??=[]).push("2.1.2");var He=globalThis,si=s=>s,se=He.trustedTypes,ai=se?se.createPolicy("lit-html",{createHTML:s=>s}):void 0,ui="$lit$",et=`lit$${Math.random().toFixed(9).slice(2)}$`,pi="?"+et,er=`<${pi}>`,pt=document,Ht=()=>pt.createComment(""),Wt=s=>s===null||typeof s!="object"&&typeof s!="function",We=Array.isArray,ir=s=>We(s)||typeof s?.[Symbol.iterator]=="function",De=`[ 	
\f\r]`,It=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,oi=/-->/g,ci=/>/g,dt=RegExp(`>|${De}(?:([^\\s"'>=/]+)(${De}*=${De}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),li=/'/g,hi=/"/g,mi=/^(?:script|style|textarea|title)$/i,ze=s=>(i,...t)=>({_$litType$:s,strings:i,values:t}),l=ze(1),f=ze(2),Wr=ze(3),mt=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),di=new WeakMap,ut=pt.createTreeWalker(pt,129);function fi(s,i){if(!We(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ai!==void 0?ai.createHTML(i):i}var rr=(s,i)=>{let t=s.length-1,e=[],r,n=i===2?"<svg>":i===3?"<math>":"",a=It;for(let o=0;o<t;o++){let c=s[o],h,m,d=-1,$=0;for(;$<c.length&&(a.lastIndex=$,m=a.exec(c),m!==null);)$=a.lastIndex,a===It?m[1]==="!--"?a=oi:m[1]!==void 0?a=ci:m[2]!==void 0?(mi.test(m[2])&&(r=RegExp("</"+m[2],"g")),a=dt):m[3]!==void 0&&(a=dt):a===dt?m[0]===">"?(a=r??It,d=-1):m[1]===void 0?d=-2:(d=a.lastIndex-m[2].length,h=m[1],a=m[3]===void 0?dt:m[3]==='"'?hi:li):a===hi||a===li?a=dt:a===oi||a===ci?a=It:(a=dt,r=void 0);let v=a===dt&&s[o+1].startsWith("/>")?" ":"";n+=a===It?c+er:d>=0?(e.push(h),c.slice(0,d)+ui+c.slice(d)+et+v):c+et+(d===-2?o:v)}return[fi(s,n+(s[t]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),e]},zt=class s{constructor({strings:i,_$litType$:t},e){let r;this.parts=[];let n=0,a=0,o=i.length-1,c=this.parts,[h,m]=rr(i,t);if(this.el=s.createElement(h,e),ut.currentNode=this.el.content,t===2||t===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(r=ut.nextNode())!==null&&c.length<o;){if(r.nodeType===1){if(r.hasAttributes())for(let d of r.getAttributeNames())if(d.endsWith(ui)){let $=m[a++],v=r.getAttribute(d).split(et),R=/([.?@])?(.*)/.exec($);c.push({type:1,index:n,name:R[2],strings:v,ctor:R[1]==="."?Ne:R[1]==="?"?Ue:R[1]==="@"?Oe:yt}),r.removeAttribute(d)}else d.startsWith(et)&&(c.push({type:6,index:n}),r.removeAttribute(d));if(mi.test(r.tagName)){let d=r.textContent.split(et),$=d.length-1;if($>0){r.textContent=se?se.emptyScript:"";for(let v=0;v<$;v++)r.append(d[v],Ht()),ut.nextNode(),c.push({type:2,index:++n});r.append(d[$],Ht())}}}else if(r.nodeType===8)if(r.data===pi)c.push({type:2,index:n});else{let d=-1;for(;(d=r.data.indexOf(et,d+1))!==-1;)c.push({type:7,index:n}),d+=et.length-1}n++}}static createElement(i,t){let e=pt.createElement("template");return e.innerHTML=i,e}};function $t(s,i,t=s,e){if(i===mt)return i;let r=e!==void 0?t._$Co?.[e]:t._$Cl,n=Wt(i)?void 0:i._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,e)),e!==void 0?(t._$Co??=[])[e]=r:t._$Cl=r),r!==void 0&&(i=$t(s,r._$AS(s,i.values),r,e)),i}var Pe=class{constructor(i,t){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:t},parts:e}=this._$AD,r=(i?.creationScope??pt).importNode(t,!0);ut.currentNode=r;let n=ut.nextNode(),a=0,o=0,c=e[0];for(;c!==void 0;){if(a===c.index){let h;c.type===2?h=new Ft(n,n.nextSibling,this,i):c.type===1?h=new c.ctor(n,c.name,c.strings,this,i):c.type===6&&(h=new Ie(n,this,i)),this._$AV.push(h),c=e[++o]}a!==c?.index&&(n=ut.nextNode(),a++)}return ut.currentNode=pt,r}p(i){let t=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(i,e,t),t+=e.strings.length-2):e._$AI(i[t])),t++}},Ft=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,t,e,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=i,this._$AB=t,this._$AM=e,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,t=this._$AM;return t!==void 0&&i?.nodeType===11&&(i=t.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,t=this){i=$t(this,i,t),Wt(i)?i===p||i==null||i===""?(this._$AH!==p&&this._$AR(),this._$AH=p):i!==this._$AH&&i!==mt&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):ir(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==p&&Wt(this._$AH)?this._$AA.nextSibling.data=i:this.T(pt.createTextNode(i)),this._$AH=i}$(i){let{values:t,_$litType$:e}=i,r=typeof e=="number"?this._$AC(i):(e.el===void 0&&(e.el=zt.createElement(fi(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===r)this._$AH.p(t);else{let n=new Pe(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(i){let t=di.get(i.strings);return t===void 0&&di.set(i.strings,t=new zt(i)),t}k(i){We(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,e,r=0;for(let n of i)r===t.length?t.push(e=new s(this.O(Ht()),this.O(Ht()),this,this.options)):e=t[r],e._$AI(n),r++;r<t.length&&(this._$AR(e&&e._$AB.nextSibling,r),t.length=r)}_$AR(i=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);i!==this._$AB;){let e=si(i).nextSibling;si(i).remove(),i=e}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},yt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,t,e,r,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=i,this.name=t,this._$AM=r,this.options=n,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=p}_$AI(i,t=this,e,r){let n=this.strings,a=!1;if(n===void 0)i=$t(this,i,t,0),a=!Wt(i)||i!==this._$AH&&i!==mt,a&&(this._$AH=i);else{let o=i,c,h;for(i=n[0],c=0;c<n.length-1;c++)h=$t(this,o[e+c],t,c),h===mt&&(h=this._$AH[c]),a||=!Wt(h)||h!==this._$AH[c],h===p?i=p:i!==p&&(i+=(h??"")+n[c+1]),this._$AH[c]=h}a&&!r&&this.j(i)}j(i){i===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},Ne=class extends yt{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===p?void 0:i}},Ue=class extends yt{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==p)}},Oe=class extends yt{constructor(i,t,e,r,n){super(i,t,e,r,n),this.type=5}_$AI(i,t=this){if((i=$t(this,i,t,0)??p)===mt)return;let e=this._$AH,r=i===p&&e!==p||i.capture!==e.capture||i.once!==e.once||i.passive!==e.passive,n=i!==p&&(e===p||r);r&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},Ie=class{constructor(i,t,e){this.element=i,this.type=6,this._$AN=void 0,this._$AM=t,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(i){$t(this,i)}};var nr=He.litHtmlPolyfillSupport;nr?.(zt,Ft),(He.litHtmlVersions??=[]).push("3.3.3");var gi=(s,i,t)=>{let e=t?.renderBefore??i,r=e._$litPart$;if(r===void 0){let n=t?.renderBefore??null;e._$litPart$=r=new Ft(i.insertBefore(Ht(),n),n,void 0,t??{})}return r._$AI(s),r};var Fe=globalThis,w=class extends V{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=gi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return mt}};w._$litElement$=!0,w.finalized=!0,Fe.litElementHydrateSupport?.({LitElement:w});var sr=Fe.litElementPolyfillSupport;sr?.({LitElement:w});(Fe.litElementVersions??=[]).push("4.2.2");var I="#0f1216",$i="#1b1b1e",yi="#26262a",ae="#35353a",B="#f2f2f7",oe="#8e8e93",ce="#6fce6f",le="#b9b02f",he="#d9564f",de="#6edc96",ue="#79828f",bi="#e0392c",bt="#0b2413",b={waste:"#ffc800",outside:"#67c814",fresh:"#19afff",inside:"#ff2e11"},vt=[b.inside,"#ff810a",b.waste],Bt=[b.outside,b.fresh],it={bright:"#e6e6ea",light:"#d7d7db",mid:"#c9c9ce",dim:"#8f8f95",dark:"#6a6a6f",darker:"#5d5d61",track:"#333338"},pe=["#6b4a12","#d99a2a","#ffb15c"],k={line:"#e8ecf2",casing:"#f8f8f8",seam:"#dcdce0",collar:"#9b9ba1",panel:"#ededf0",panelEdge:"#c9c9ce",ink:"#4a4a50",dim:"#7e7e85",fainter:"#8e8e95",wordmark:"#8b8b90",wordmarkDim:"#adadb2",led:"#61d960"},_={canvas:"18px",pill:"13px",button:"12px",chip:"999px"},ar=923,or=500,vi=ar/or,xt=Math.round(2*vi*10)/10,U=Math.round(1.4*vi*10)/10,ft=Math.round(U*.9*10)/10,me=Math.round(U*.72*10)/10,xi="12px",wi="500",_i="13px";var u=s=>re(s);function D(s,i){if(!s||!i)return;let t=s.states[i];if(!t||t.state==="unavailable"||t.state==="unknown")return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}function wt(s,i){if(!s||!i)return;let t=s.states[i];if(t&&!(t.state==="unavailable"||t.state==="unknown"))return t.state}function jt(s,i){return wt(s,i)==="on"}function ki(s,i=1){return s===void 0?"--":s.toFixed(i)}function Be(s){if(!s||s<=0)return"";let i=Math.floor(s/3600),t=Math.floor(s%3600/60);return i>0?`${i}h ${t}m`:t>0?`${t}m`:`${s}s`}var L="sensor.jablotron_futura",K={co2:{label:"CO\u2082",unit:"ppm",icon:"mdi:leaf",digits:0,min:400,max:1200},temperature:{label:"Temperature",unit:"\xB0C",icon:"mdi:thermometer",digits:1,min:18,max:28},humidity:{label:"Humidity",unit:"%",icon:"mdi:water-percent",digits:0,min:30,max:70}},cr=/^_(alfa|co2_sensor|wall_controller|external_sensor)_\d+_/;function fe(s,i,t){if(!s)return[];let e=`_${t}`;return Object.keys(s.states).filter(r=>!r.startsWith(i)||!r.endsWith(e)||!cr.test(r.slice(i.length))?!1:!r.includes("_ntc_")&&!r.includes("_floor_")).sort()}function je(s,i){return s?.entities?.[i]?.device_id??void 0}function ge(s,i,t){let e=s?.states[i]?.attributes?.friendly_name;if(!e)return i;let r=je(s,i),n=r?s?.devices?.[r]:void 0,a=n?.name_by_user||n?.name;return(a&&e.toLowerCase().startsWith(a.toLowerCase())?e.slice(a.length):e.replace(/^Jablotron Futura\s*/i,"")).replace(/\sCO2$/i,"").replace(new RegExp(`\\s*${t}$`,"i"),"").trim()}function O(s){return l`<div class="futura-error">${s}</div>`}var P=A`
  :host {
    /* Theme tokens where the card should follow the user's HA theme, fixed
       tokens where it must match artwork. Every fallback and every fixed value
       comes from tokens.ts. */
    --futura-bg: var(--ha-card-background, var(--card-background-color, ${u(I)}));
    --futura-panel: var(--secondary-background-color, rgba(255, 255, 255, 0.06));
    --futura-text: var(--primary-text-color, ${u(B)});
    --futura-muted: var(--secondary-text-color, ${u(oe)});
    /* Active controls take the "running" green, not the "reading is good" one. */
    --futura-accent: var(--state-icon-active-color, ${u(de)});
    --futura-good: ${u(ce)};
    --futura-moderate: ${u(le)};
    --futura-poor: ${u(he)};
    --futura-fault: ${u(bi)};
    --futura-neutral: ${u(ue)};
    /* One canvas radius, not HA's 16px default fighting the cards' own 18. */
    --futura-radius: ${u(_.canvas)};
    display: block;
  }

  ha-card {
    background: var(--futura-bg);
    color: var(--futura-text);
    border-radius: var(--futura-radius);
    padding: 16px;
    overflow: hidden;
  }

  .futura-error {
    padding: 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--futura-fault) 15%, transparent);
    color: var(--futura-fault);
    font-size: 0.9rem;
  }

  .muted {
    color: var(--futura-muted);
  }

  /*
   * The one "value over artwork" pill, shared by every card -- same radius,
   * ground, hairline and type, so a reading looks the same wherever it is
   * printed. Numerals are tabular because these all carry a
   * live number: without it the label slides sideways when 9.9 becomes 10.0.
   */
  .readout-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: ${u(_.pill)};
    background: rgba(12, 14, 18, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    font-size: ${u(xi)};
    font-weight: ${u(wi)};
    color: rgba(255, 255, 255, 0.92);
    font-variant-numeric: tabular-nums;
  }

  .readout-pill ha-icon {
    --mdc-icon-size: ${u(_i)};
    opacity: 0.75;
    flex: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`;var lr=[["temp_ambient","outside_air_temperature"],["temp_fresh","supply_air_temperature"],["temp_indoor","extract_air_temperature"],["temp_waste","exhaust_air_temperature"],["humidity_ambient","outside_air_humidity"],["humidity_fresh","supply_air_humidity"],["humidity_indoor","extract_air_humidity"],["humidity_waste","exhaust_air_humidity"],["air_flow","air_flow"],["heat_recovered","heat_recovered"],["filter_wear","filter_clogging"],["air_quality","air_quality"],["temp_outdoor","outdoor_temperature"]],hr=923,Ai=660,Vt=146,Kt=90,Xt=252,nt=Kt+Vt/2,st=Xt+Vt/2,H=192,at=470,Ge=16,Ci=13,dr=28,ur=36,Ve=Ci*2,Ke=52,Gt=630,Ei=b.waste,Si=b.outside,pr=b.fresh,mr=b.inside,fr=[{label:"waste",tempKey:"temp_waste",humidityKey:"humidity_waste",x:Kt,direction:"up",color:Ei,strong:!1,row:"top"},{label:"outside",tempKey:"temp_ambient",humidityKey:"humidity_ambient",x:Xt,direction:"down",color:Si,strong:!0,row:"top"},{label:"supply",tempKey:"temp_fresh",humidityKey:"humidity_fresh",x:Kt,direction:"down",color:pr,strong:!0,row:"bottom"},{label:"inside",tempKey:"temp_indoor",humidityKey:"humidity_indoor",x:Xt,direction:"up",color:mr,strong:!1,row:"bottom"}],ot=class ot extends w{constructor(){super(...arguments);this.config={type:"custom:futura-flow-card"};this.labelWidths={}}connectedCallback(){super.connectedCallback(),document.fonts?.ready.then(()=>{this.labelWidths={},this.requestUpdate()})}updated(){let t=this.renderRoot.querySelectorAll("text[data-measure]"),e=!1;t.forEach(r=>{let n=r.dataset.measure;if(!n)return;let a=r.getComputedTextLength();a&&Math.abs((this.labelWidths[n]??0)-a)>.5&&(this.labelWidths[n]=a,e=!0)}),e&&this.requestUpdate()}pairLayout(t,e,r=12){let n=this.labelWidths[t]??0,a=e+r+n,o=Gt-a/2;return{iconX:o,textCx:o+e+r+n/2}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={show_filter:!0,show_outdoor:!0,...t},this.toggleAttribute("theme-aware",!!this.config.theme_aware)}getCardSize(){return 7}static getStubConfig(){return{type:"custom:futura-flow-card",prefix:L}}entity(t){let e=this.config[t];if(typeof e=="string")return e;let r=lr.find(([n])=>n===t)?.[1];return r?`${this.config.prefix??L}_${r}`:void 0}value(t){return D(this.hass,this.entity(t))}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}static arrow(t,e,r,n){let a=Ci,o=dr,c=ur;return n?`M ${t-a} ${r} L ${t-a} ${e+c} L ${t-o} ${e+c} L ${t} ${e} L ${t+o} ${e+c} L ${t+a} ${e+c} L ${t+a} ${r} Z`:`M ${t-a} ${e} L ${t-a} ${r-c} L ${t-o} ${r-c} L ${t} ${r} L ${t+o} ${r-c} L ${t+a} ${r-c} L ${t+a} ${e} Z`}cycle(){let t=this.value("air_flow")??0;return t<=0?0:Math.max(.8,Math.min(3.5,300/t))}ductGroup(t){let e=this.value(t.tempKey),r=this.value(t.humidityKey),n=t.x+Vt/2,a=t.row==="top",o=a?46:596,c=a?88:638,h=a?112:492,m=a?168:548,d=a?0:484,$=a?H-2:Ai-484;return f`
      <g>
        <rect x=${t.x} y=${d} width=${Vt} height=${$}
              fill="var(--app-panel)" />
        <text x=${n} y=${o} text-anchor="middle"
              font-size="40" font-weight=${t.strong?600:400}
              fill=${t.strong?"var(--app-text)":it.mid}>
          ${ot.decimal(e)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
        <text x=${n} y=${c} text-anchor="middle"
              font-size="27" fill="var(--app-dim)">
          ${r===void 0?"--":Math.round(r)} %
        </text>
        <path d=${ot.arrow(n,h,m,t.direction==="up")}
              fill=${t.color} />
      </g>
    `}collar(t,e){return f`<rect x=${t+4} y=${e} width=${Vt-8} height=${Ge}
                     rx="5" fill="url(#metal)" />`}ribbons(){let t=this.cycle(),e=t?`animation-duration:${t}s`:"animation-play-state:paused",r=`M ${st} ${H-6} L ${st} 252 C ${st} 306, ${nt} 336, ${nt} 392 L ${nt} ${at+6}`,n=`M ${st} ${at+6} L ${st} 392 C ${st} 336, ${nt} 306, ${nt} 252 L ${nt} ${H-6}`,a=(o,c,h)=>f`
      <g>
        <path d=${o} stroke=${h} stroke-width=${Ve+7}
              fill="none" stroke-linecap="round" opacity="0.5"
              filter="url(#glow)" />
        <path d=${o} stroke=${`url(#${c})`} stroke-width=${Ve}
              fill="none" stroke-linecap="round" />
        <path class="sheen" d=${o} stroke="rgba(255,255,255,0.18)"
              stroke-width=${Ve} fill="none" stroke-linecap="butt"
              stroke-dasharray="8 40" style=${e} />
      </g>
    `;return f`
      ${a(n,"extractGrad",Ei)}
      ${a(r,"supplyGrad",Si)}
    `}info(){let t=wt(this.hass,this.entity("air_quality")),e=this.value("heat_recovered"),r=t==="good"?ce:t==="poor"?he:t==="moderate"?le:ue,n=t?t[0].toUpperCase()+t.slice(1):"Unknown",a=e===void 0?"--":(e/1e3).toFixed(1).replace(".",","),o=this.pairLayout("quality",22);return f`
      <g text-anchor="middle">
        <circle cx=${o.iconX+11} cy="264" r="11" fill=${r} />
        <text data-measure="quality" x=${o.textCx} y="274"
              font-size="35" font-weight="600"
              fill="var(--app-text)">${n}</text>
        <text x=${Gt} y="310" font-size="27"
              fill="var(--app-dim)">Air quality</text>
        <text x=${Gt} y="374" font-size="35" font-weight="600"
              fill="var(--app-text)">${a} kW</text>
        <text x=${Gt} y="410" font-size="27"
              fill="var(--app-dim)">Recovered</text>
      </g>
    `}outdoor(){if(this.config.show_outdoor===!1)return p;let t=this.value("temp_outdoor");if(t==null)return p;let e=this.pairLayout("outdoor",22);return f`
      <g>
        <path d=${ot.thermometer(e.iconX,Ke-10)}
              fill="none" stroke="var(--app-dim)" stroke-width=${U}
              stroke-linecap="round" />
        <text data-measure="outdoor" x=${e.textCx} y=${Ke}
              text-anchor="middle" font-size="27"
              fill="var(--app-dim)">Outdoor</text>
        <text x=${Gt} y=${Ke+52} text-anchor="middle"
              font-size="40" font-weight="600" fill="var(--app-text)">
          ${ot.decimal(t)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
      </g>
    `}static thermometer(t,e){return`M ${t+5} ${e-10} a 6 6 0 0 1 12 0 v 16 a 9 9 0 1 1 -12 0 Z`}glyphs(){return f`
      <g stroke="var(--app-dim)" fill="none" stroke-width=${U}
         stroke-linecap="round" opacity="0.85">
        <path d="M 100 222 h 22 M 104 222 v 20 a 3 3 0 0 0 3 3 h 8
                 a 3 3 0 0 0 3 -3 v -20 M 108 218 h 6" />
        <path d="M 390 220 c -18 1 -30 11 -30 24 c 0 8 5 13 12 13
                 c 14 0 24 -14 18 -37 Z" />
        <path d="M 386 226 c -10 6 -17 15 -21 25" />
        <path d="M 228 448 v -14 l 13 -11 l 13 11 v 14" />
      </g>
    `}filterBar(){if(this.config.show_filter===!1)return p;let t=this.value("filter_wear");if(t===void 0)return p;let e=Math.min(100,Math.max(0,t));return l`
      <div class="filter">
        <div class="head">
          <span class="name">Filter clogging</span>
          <span class="pct">${Math.round(t)} %</span>
        </div>
        <div class="bar"><span style=${`width:${e}%`}></span></div>
      </div>
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=this.entity("temp_ambient");return t&&!this.hass.states[t]?l`<ha-card>
        ${O(`Entity ${t} not found. Set "prefix" or name the entities explicitly.`)}
      </ha-card>`:l`
      <ha-card>
        <div class="schematic">
          <svg viewBox="0 0 ${hr} ${Ai}" role="img"
               aria-label="Air flow through the heat exchanger">
            <defs>
              <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color=${it.darker} />
                <stop offset="22%" stop-color=${it.light} />
                <stop offset="48%" stop-color=${it.dim} />
                <stop offset="74%" stop-color=${it.bright} />
                <stop offset="100%" stop-color=${it.dark} />
              </linearGradient>
              <linearGradient id="supplyGrad" gradientUnits="userSpaceOnUse"
                x1=${st} y1=${H} x2=${nt} y2=${at}>
                <stop offset="0%" stop-color=${Bt[0]} />
                <stop offset="100%" stop-color=${Bt[1]} />
              </linearGradient>
              <linearGradient id="extractGrad" gradientUnits="userSpaceOnUse"
                x1=${st} y1=${at} x2=${nt} y2=${H}>
                <stop offset="0%" stop-color=${vt[0]} />
                <stop offset="50%" stop-color=${vt[1]} />
                <stop offset="100%" stop-color=${vt[2]} />
              </linearGradient>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              <clipPath id="bodyClip">
                <rect x="62" y=${H} width="800" height=${at-H}
                      rx="16" />
              </clipPath>
            </defs>

            ${fr.map(e=>this.ductGroup(e))}
            ${this.outdoor()}

            ${this.collar(Kt,H-Ge)}
            ${this.collar(Xt,H-Ge)}
            ${this.collar(Kt,at)}
            ${this.collar(Xt,at)}

            <rect x="62" y=${H} width="800" height=${at-H}
                  rx="16" fill="var(--app-body)" stroke="var(--app-border)"
                  stroke-width=${me} />
            <g clip-path="url(#bodyClip)">${this.ribbons()}</g>
            ${this.glyphs()}
            ${this.info()}
          </svg>
        </div>
        ${this.filterBar()}
      </ha-card>
    `}};ot.properties={hass:{attribute:!1},config:{state:!0}},ot.styles=[P,A`
      :host {
        --app-bg: ${u(I)};
        --app-panel: ${u($i)};
        --app-body: ${u(yi)};
        --app-border: ${u(ae)};
        --app-text: ${u(B)};
        --app-dim: ${u(oe)};
      }

      :host([theme-aware]) {
        --app-bg: transparent;
        --app-panel: var(--futura-panel);
        --app-body: var(--futura-panel);
        --app-border: color-mix(in srgb, var(--futura-text) 14%, transparent);
        --app-text: var(--futura-text);
        --app-dim: var(--futura-muted);
      }

      /* The host must carry the height too, or height:100% on the ha-card
         below resolves against an auto-height containing block and does
         nothing. */
      :host {
        display: block;
        height: 100%;
      }

      /* Two stacked panels with a gap, the way the app lays them out, so the
         host card itself carries no surface of its own.

         height: 100% so the card fills its grid row rather than shrinking to
         its content. Paired with margin-top:auto on the filter panel, that
         pins the filter to the bottom of the row, so it lines up with whatever
         sits beside it -- the control card, whose height moves with how many
         rows the function chips wrap into. */
      ha-card {
        background: var(--app-bg);
        border: none;
        box-shadow: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 14px;
        height: 100%;
      }

      .schematic {
        background: var(--app-bg);
        border-radius: ${u(_.canvas)};
        padding: 4px 0 0;
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
        font-family: inherit;
      }

      .filter {
        background: var(--app-panel);
        border-radius: ${u(_.canvas)};
        padding: 20px 22px 26px;
        /* Takes up the slack, so the panel sits at the bottom of the card. */
        margin-top: auto;
      }

      .filter .head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 16px;
      }

      .filter .name {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--app-text);
      }

      .filter .pct {
        font-size: 1.05rem;
        color: var(--app-dim);
        font-variant-numeric: tabular-nums;
      }

      .bar {
        height: 12px;
        border-radius: 999px;
        background: ${u(it.track)};
        overflow: hidden;
      }

      .bar > span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          ${u(pe[0])} 0%,
          ${u(pe[1])} 60%,
          ${u(pe[2])} 100%
        );
        transition: width 0.6s ease;
      }

      .sheen {
        animation: drift linear infinite;
      }

      @keyframes drift {
        to {
          stroke-dashoffset: -120;
        }
      }
    `];var $e=ot;var gr={ventilation:"Ventilation",auto:"Auto",temperature:"Temperature",now:"now",humidity:"Humidity",dry:"Dry",comfort:"Comfort",wet:"Wet",functions:"Functions",boost:"Boost",circulation:"Circulation",overpressure:"Overpressure",night:"Night",party:"Party",stopAll:"Stop all",vacancy:"Vacancy",from:"From",until:"Until",clearVacancy:"Cancel vacancy",save:"Save",duration:"Duration",off:"Off",cancel:"Cancel",start:"Start",stop:"Stop",left:"left",stopping:"Stopping\u2026",stoppingHint:"Waiting for the unit to confirm.",overriddenTitle:"The unit restarted this function",overriddenBody:"The stop was accepted but the function is still running, so something on the unit is holding it on \u2014 typically a latched kitchen-hood or boost input, an ALFA controller setting, or a wall button. Clear it there and stop again."},$r=["off","1","2","3","4","5","auto"],yr=[{option:"dry",label:"dry"},{option:"comfort",label:"comfort"},{option:"wet",label:"wet"}],ye="jablotron_futura_modbus";function br(s){return{active:`binary_sensor.${s}_away_active`,begins:`sensor.${s}_away_begins`,ends:`sensor.${s}_away_ends`}}function Ti(s){let i=t=>String(t).padStart(2,"0");return`${s.getFullYear()}-${i(s.getMonth()+1)}-${i(s.getDate())}T${i(s.getHours())}:${i(s.getMinutes())}`}function Xe(s,i){let t=s?.states[i]?.state;if(!t||t==="unknown"||t==="unavailable")return;let e=new Date(t);return Number.isNaN(e.getTime())?void 0:e}var vr=[{key:"boost",label:"boost",icon:"mdi:fan-plus",remaining:"boost_remaining",active:"boost_active"},{key:"circulation",label:"circulation",icon:"mdi:autorenew",remaining:"circulation_remaining",active:"circulation_active"},{key:"overpressure",label:"overpressure",icon:"mdi:weather-windy",remaining:"overpressure_remaining",active:"overpressure_active"},{key:"night",label:"night",icon:"mdi:weather-night",remaining:"night_mode_remaining",active:"night_active"},{key:"party",label:"party",icon:"mdi:glass-cocktail",remaining:"party_mode_remaining",active:"party_active"}];function xr(s){return vr.map(i=>({...i,remaining:`sensor.${s}_${i.remaining}`,active:`binary_sensor.${s}_${i.active}`,limit:`number.${s}_${i.remaining}`}))}var qe=5;function wr(s){let i=[15,30,60,120,240,480,600];return(s<=120?[5,...i]:i).filter(t=>t<=s)}var _r=35e3,kr=6e3;function Ye(s){if(s<=0)return"Off";let i=Math.floor(s/60),t=s%60;return i&&t?`${i} h ${t} min`:i?`${i} h`:`${t} min`}var _t=class extends w{constructor(){super(...arguments);this.config={type:"custom:futura-control-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={show_functions:!0,show_humidity:!0,...t}}getCardSize(){return 5}static getStubConfig(){return{type:"custom:futura-control-card"}}get base(){return(this.config.prefix??L).replace(/^[a-z_]+\./,"")}get chips(){return xr(this.base)}get away(){return br(this.base)}get target(){let t=je(this.hass,this.selectEntity);return t?{device_id:t}:{}}get selectEntity(){return this.config.ventilation_select??`select.${this.base}_ventilation`}t(t){return this.config.labels?.[t]??gr[t]}get humidityEntity(){return this.config.humidity_select??`select.${this.base}_humidity_mode`}get climateEntity(){return this.config.climate??`climate.${this.base}`}async setLevel(t){await this.hass?.callService("select","select_option",{entity_id:this.selectEntity,option:t})}async nudge(t){let e=this.hass?.states[this.climateEntity],r=Number(e?.attributes?.temperature);if(!Number.isFinite(r))return;let n=Number(e?.attributes?.min_temp),a=Number(e?.attributes?.max_temp),o=Number(e?.attributes?.target_temp_step)||.5,c=r+t;c=Math.round(c/o)*o,Number.isFinite(n)&&(c=Math.max(n,c)),Number.isFinite(a)&&(c=Math.min(a,c)),c!==r&&await this.hass?.callService("climate","set_temperature",{entity_id:this.climateEntity,temperature:c})}atLimit(t){let e=this.hass?.states[this.climateEntity],r=Number(e?.attributes?.temperature);if(!Number.isFinite(r))return!0;let n=Number(e?.attributes?.[t<0?"min_temp":"max_temp"]);return Number.isFinite(n)?t<0?r<=n:r>=n:!1}async setHumidity(t){await this.hass?.callService("select","select_option",{entity_id:this.humidityEntity,option:t})}humidity(){if(this.config.show_humidity===!1)return p;if(!this.hass?.states[this.humidityEntity])return p;let t=wt(this.hass,this.humidityEntity);return l`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:water-percent"></ha-icon>${this.t("humidity")}
          </span>
          <span class="current">
            ${t?this.t(t):"--"}
          </span>
        </div>
        <div class="modes">
          ${yr.map(e=>l`
              <button
                class="level"
                aria-pressed=${t===e.option?"true":"false"}
                @click=${()=>this.setHumidity(e.option)}
              >
                ${this.t(e.label)}
              </button>
            `)}
        </div>
      </section>
    `}maxMinutes(t){let e=Number(this.hass?.states[t.limit]?.attributes?.max);return Number.isFinite(e)&&e>0?Math.round(e/60):120}openPicker(t){let e=D(this.hass,t.remaining)??0,r=e>0?Math.ceil(e/60/qe)*qe:Math.min(60,this.maxMinutes(t));this.picker={fn:t,minutes:Math.min(r,this.maxMinutes(t))}}openAwayPicker(){let t=Xe(this.hass,this.away.begins),e=Xe(this.hass,this.away.ends),r=new Date,n=new Date(r.getTime()+168*3600*1e3);this.awayPicker={begin:Ti(t??r),end:Ti(e??n)}}closeAwayPicker(){this.awayPicker=void 0}async setAway(t,e){await this.hass?.callService(ye,"set_away",{...this.target,begin:t,end:e}),this.closeAwayPicker()}async clearAway(){await this.hass?.callService(ye,"clear_away",{...this.target}),this.closeAwayPicker()}closePicker(){window.clearTimeout(this.stopTimeout),this.picker=void 0,this.stopState=void 0}async runFunction(t,e){await this.hass?.callService(ye,"set_function",{...this.target,function:t.key,duration:Math.round(e)*60}),this.closePicker()}async stopFunction(t){this.stopState={fn:t,phase:"waiting",since:Date.now()},await this.hass?.callService(ye,"set_function",{...this.target,function:t.key,duration:0}),window.clearTimeout(this.stopTimeout),this.stopTimeout=window.setTimeout(()=>this.judgeStop(),_r)}hasStopped(t){return(D(this.hass,t.remaining)??0)<=0&&!jt(this.hass,t.active)}judgeStop(){let t=this.stopState;t&&(this.stopState=this.hasStopped(t.fn)?void 0:{fn:t.fn,phase:"overridden",since:t.since},this.stopState||this.closePicker())}willUpdate(t){t.has("hass")&&this.stopState?.phase==="waiting"&&Date.now()-this.stopState.since>=kr&&this.hasStopped(this.stopState.fn)&&(window.clearTimeout(this.stopTimeout),this.stopState=void 0,this.picker=void 0)}disconnectedCallback(){window.clearTimeout(this.stopTimeout),super.disconnectedCallback()}async stopAll(){await this.hass?.callService("button","press",{entity_id:`button.${this.base}_stop_all_functions`})}stopNotice(){return this.stopState?.phase==="waiting"?l`
        <div class="notice">
          <ha-icon icon="mdi:timer-sand"></ha-icon>
          <div>
            <strong>${this.t("stopping")}</strong>
            <p>${this.t("stoppingHint")}</p>
          </div>
        </div>
      `:l`
      <div class="notice warn">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <div>
          <strong>${this.t("overriddenTitle")}</strong>
          <p>${this.t("overriddenBody")}</p>
        </div>
      </div>
    `}awayDialog(){let t=this.awayPicker;if(!t)return p;let e=jt(this.hass,this.away.active),r=!t.begin||!t.end||t.end<=t.begin;return l`
      <div
        class="scrim"
        @click=${n=>{n.target===n.currentTarget&&this.closeAwayPicker()}}
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.t("vacancy")}
          @keydown=${n=>{n.key==="Escape"&&this.closeAwayPicker()}}
        >
          <div class="dialog-head">
            <ha-icon icon="mdi:calendar-account"></ha-icon>
            <span>${this.t("vacancy")}</span>
          </div>

          <label class="field">
            <span>${this.t("from")}</span>
            <input
              type="datetime-local"
              .value=${t.begin}
              @input=${n=>{let a=n.target.value;this.awayPicker={...t,begin:a}}}
            />
          </label>

          <label class="field">
            <span>${this.t("until")}</span>
            <input
              type="datetime-local"
              .value=${t.end}
              min=${t.begin}
              @input=${n=>{let a=n.target.value;this.awayPicker={...t,end:a}}}
            />
          </label>

          <div class="actions">
            <button class="ghost" @click=${()=>this.closeAwayPicker()}>
              ${this.t("cancel")}
            </button>
            ${e?l`<button class="ghost" @click=${()=>this.clearAway()}>
                  ${this.t("clearVacancy")}
                </button>`:p}
            <button
              class="primary"
              ?disabled=${r}
              @click=${()=>this.setAway(t.begin,t.end)}
            >
              ${this.t("save")}
            </button>
          </div>
        </div>
      </div>
    `}pickerDialog(){let t=this.picker;if(!t)return p;let{fn:e,minutes:r}=t,n=this.maxMinutes(e),a=D(this.hass,e.remaining)??0;return l`
      <div
        class="scrim"
        @click=${o=>{o.target===o.currentTarget&&this.closePicker()}}
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${`${e.label} duration`}
          @keydown=${o=>{o.key==="Escape"&&this.closePicker()}}
        >
          <div class="dialog-head">
            <ha-icon icon=${e.icon}></ha-icon>
            <span>${this.t(e.label)}</span>
            ${a>0?l`<span class="running">
                  ${Be(a)} ${this.t("left")}
                </span>`:p}
          </div>

          ${this.stopState?.fn.key===e.key?this.stopNotice():l`<div class="readout">${Ye(r)}</div>`}

          ${this.stopState?.fn.key===e.key?p:l`
          <input
            class="slider"
            type="range"
            min="0"
            max=${n}
            step=${qe}
            .value=${String(r)}
            aria-label="Duration in minutes"
            @input=${o=>{let c=Number(o.target.value);this.picker={fn:e,minutes:c}}}
          />
          <div class="scale">
            <span>${this.t("off")}</span><span>${Ye(n)}</span>
          </div>`}

          <div class="quick" ?hidden=${this.stopState?.fn.key===e.key}>
            ${wr(n).map(o=>l`
                  <button
                    class=${o===r?"chip on":"chip"}
                    @click=${()=>{this.picker={fn:e,minutes:o}}}
                  >
                    ${Ye(o)}
                  </button>
                `)}
          </div>

          <div class="actions">
            <button class="ghost" @click=${()=>this.closePicker()}>
              ${this.t("cancel")}
            </button>
            ${a>0&&this.stopState?.fn.key!==e.key?l`<button class="ghost stop"
                       @click=${()=>this.stopFunction(e)}>
                       ${this.t("stop")}</button>`:p}
            ${this.stopState?.fn.key===e.key?p:l`
                  <button
                    class="primary"
                    ?disabled=${r<=0}
                    @click=${()=>this.runFunction(e,r)}
                  >
                    ${this.t("start")}
                  </button>
                `}
          </div>
        </div>
      </div>
    `}ventilation(){let t=wt(this.hass,this.selectEntity);return l`
      <section>
        <div class="head">
          <span class="name"><ha-icon icon="mdi:fan"></ha-icon>${this.t("ventilation")}</span>
          <span class="current">
            ${t==="auto"?this.t("auto"):t??"--"}
          </span>
        </div>
        <div class="levels">
          ${$r.map(e=>l`
              <button
                class="level"
                aria-pressed=${t===e?"true":"false"}
                title=${e==="off"?"Off":e==="auto"?"Automatic":`Level ${e}`}
                @click=${()=>this.setLevel(e)}
              >
                ${e==="off"?"0":e==="auto"?"A":e}
              </button>
            `)}
        </div>
      </section>
    `}temperature(){let t=this.hass?.states[this.climateEntity],e=Number(t?.attributes?.temperature),r=Number(t?.attributes?.current_temperature);return l`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:thermometer"></ha-icon>${this.t("temperature")}
          </span>
          <span class="current">
            ${Number.isFinite(r)?`${r.toFixed(1)} \xB0C ${this.t("now")}`:"--"}
          </span>
        </div>
        <div class="stepper">
          <button
            ?disabled=${this.atLimit(-.5)}
            @click=${()=>this.nudge(-.5)}
            aria-label="Lower target"
          >
            &minus;
          </button>
          <span class="target">
            ${Number.isFinite(e)?e.toFixed(1):"--"} °C
          </span>
          <button
            ?disabled=${this.atLimit(.5)}
            @click=${()=>this.nudge(.5)}
            aria-label="Raise target"
          >
            &plus;
          </button>
        </div>
      </section>
    `}awayChip(){if(this.hass?.states[this.away.ends]===void 0)return p;let t=jt(this.hass,this.away.active),e=Xe(this.hass,this.away.ends),r=t&&e?e.toLocaleDateString(void 0,{day:"numeric",month:"short"}):"";return l`
      <button
        class="chip"
        data-active=${t?"true":"false"}
        title=${this.t("vacancy")}
        @click=${()=>this.openAwayPicker()}
      >
        <ha-icon icon="mdi:calendar-account"></ha-icon>${this.t("vacancy")}
        ${r?l`<span class="time">${r}</span>`:p}
      </button>
    `}functions(){if(this.config.show_functions===!1)return p;let t=this.chips.filter(e=>this.hass?.states[e.remaining]!==void 0);return!t.length&&this.hass?.states[this.away.ends]===void 0?p:l`
      <section>
        <div class="head">
          <span class="name">
            <ha-icon icon="mdi:timer-outline"></ha-icon>${this.t("functions")}
          </span>
        </div>
        <div class="chips">
          ${t.map(e=>{let r=jt(this.hass,e.active),n=Be(D(this.hass,e.remaining));return l`
              <button
                class="chip"
                data-active=${r?"true":"false"}
                title=${`${this.t("duration")}: ${this.t(e.label)}`}
                @click=${()=>this.openPicker(e)}
              >
                <ha-icon icon=${e.icon}></ha-icon>${this.t(e.label)}
                ${n?l`<span class="time">${n}</span>`:p}
              </button>
            `})}
          ${this.awayChip()}
          ${t.some(e=>(D(this.hass,e.remaining)??0)>0)?l`
                <button class="chip" @click=${()=>this.stopAll()}>
                  <ha-icon icon="mdi:stop-circle-outline"></ha-icon>${this.t("stopAll")}
                </button>
              `:p}
        </div>
      </section>
    `}render(){return this.hass?this.hass.states[this.selectEntity]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        ${this.ventilation()} ${this.temperature()} ${this.humidity()}
        ${this.functions()} ${this.pickerDialog()} ${this.awayDialog()}
      </ha-card>
    `:l`<ha-card>
        ${O(`Entity ${this.selectEntity} not found.`)}
      </ha-card>`:l`<ha-card></ha-card>`}};_t.properties={hass:{attribute:!1},config:{state:!0},picker:{state:!0},awayPicker:{state:!0},stopState:{state:!0}},_t.styles=[P,A`
      ha-card {
        position: relative;
      }

      .title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 14px;
      }

      section {
        margin-bottom: 18px;
      }

      section:last-of-type {
        margin-bottom: 0;
      }

      .head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 10px;
      }

      .head .name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
      }

      .head .current {
        font-size: 0.95rem;
        color: var(--futura-muted);
        font-variant-numeric: tabular-nums;
      }

      .levels {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 6px;
      }

      .modes {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      button.level {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 10px 0;
        border-radius: ${u(_.button)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-weight: 600;
        transition: background 0.2s ease, color 0.2s ease;
      }

      button.level:hover {
        background: rgba(255, 255, 255, 0.12);
      }

      button.level[aria-pressed='true'] {
        background: var(--futura-accent);
        color: ${u(bt)};
      }

      button.level:focus-visible {
        outline: 2px solid var(--futura-accent);
        outline-offset: 2px;
      }

      .stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: var(--futura-panel);
        border-radius: ${u(_.button)};
        padding: 8px 12px;
      }

      .stepper .target {
        font-size: 1.5rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .stepper button {
        appearance: none;
        border: none;
        cursor: pointer;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: var(--futura-text);
        font-size: 1.3rem;
        line-height: 1;
      }

      .stepper button:hover:not([disabled]) {
        background: rgba(255, 255, 255, 0.18);
      }

      .stepper button[disabled] {
        opacity: 0.35;
        cursor: default;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      button.chip {
        appearance: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: ${u(_.chip)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-size: 0.85rem;
        transition: background 0.2s ease, box-shadow 0.2s ease;
      }

      button.chip[data-active='true'] {
        background: rgba(143, 195, 107, 0.22);
        box-shadow: inset 0 0 0 1px var(--futura-accent);
        color: var(--futura-accent);
      }

      button.chip .time {
        font-variant-numeric: tabular-nums;
        opacity: 0.85;
      }

      ha-icon {
        --mdc-icon-size: 18px;
      }

      /* Duration picker. Positioned over the card rather than in a native
         <dialog>, which cannot escape a Lovelace card's stacking context. */
      .scrim {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        display: grid;
        place-items: center;
        border-radius: var(--futura-radius);
        z-index: 5;
      }

      .dialog {
        width: min(340px, calc(100% - 32px));
        background: var(--futura-bg);
        border-radius: ${u(_.canvas)};
        padding: 18px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .dialog-head {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        font-weight: 600;
      }

      .dialog-head .running {
        margin-left: auto;
        font-size: 0.8rem;
        font-weight: 400;
        color: var(--futura-accent);
      }

      .notice {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px;
        border-radius: ${u(_.button)};
        background: var(--futura-panel);
      }

      .notice.warn {
        background: rgba(217, 86, 79, 0.14);
        box-shadow: inset 0 0 0 1px rgba(217, 86, 79, 0.4);
      }

      .notice ha-icon {
        flex: none;
        margin-top: 1px;
        color: var(--futura-muted);
      }

      .notice.warn ha-icon {
        color: var(--futura-poor);
      }

      .notice strong {
        font-size: 0.92rem;
      }

      .notice p {
        margin: 4px 0 0;
        font-size: 0.8rem;
        line-height: 1.45;
        color: var(--futura-muted);
      }

      .readout {
        text-align: center;
        font-size: 1.7rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .slider {
        width: 100%;
        accent-color: var(--futura-accent);
      }

      .scale {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--futura-muted);
        margin-top: -8px;
      }

      .quick {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .quick .chip {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 6px 10px;
        border-radius: ${u(_.chip)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-size: 0.78rem;
      }

      .quick .chip.on {
        background: var(--futura-accent);
        color: ${u(bt)};
      }

      /* The vacancy dialog's two datetime fields. */
      .field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 0.92rem;
        color: var(--futura-muted);
      }

      .field input {
        appearance: none;
        flex: 1 1 auto;
        min-width: 0;
        max-width: 62%;
        background: var(--futura-panel);
        color: var(--futura-text);
        border: 1px solid ${u(ae)};
        border-radius: ${u(_.button)};
        padding: 9px 11px;
        font: inherit;
        font-size: 0.95rem;
        font-variant-numeric: tabular-nums;
      }

      .field input::-webkit-calendar-picker-indicator {
        /* The stock indicator is near-black on this ground. */
        filter: invert(1) opacity(0.65);
        cursor: pointer;
      }

      .field input:focus-visible {
        outline: 2px solid var(--futura-accent);
        outline-offset: 1px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
        flex-wrap: wrap;
      }

      .actions button {
        appearance: none;
        border: none;
        cursor: pointer;
        padding: 9px 16px;
        border-radius: ${u(_.button)};
        font: inherit;
        font-weight: 600;
      }

      .actions .ghost {
        background: var(--futura-panel);
        color: var(--futura-text);
      }

      .actions .stop {
        color: var(--futura-poor);
      }

      .actions .primary {
        background: var(--futura-accent);
        color: ${u(bt)};
      }

      .actions .primary[disabled] {
        opacity: 0.4;
        cursor: default;
      }
    `];var kt=class extends w{constructor(){super(...arguments);this.config={type:"custom:futura-sensor-grid-card",metric:"co2"}}setConfig(t){if(!t)throw new Error("Missing configuration");if(t.metric&&!(t.metric in K))throw new Error(`metric must be one of ${Object.keys(K).join(", ")}`);this.config={metric:"co2",columns:3,...t}}getCardSize(){return 3}static getStubConfig(){return{type:"custom:futura-sensor-grid-card",metric:"co2"}}tiles(){let t=this.config.metric??"co2";return fe(this.hass,this.config.prefix??L,t).map(e=>{let r=Number(this.hass.states[e].state);return{entityId:e,name:ge(this.hass,e,t),value:Number.isFinite(r)?r:void 0}})}open(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=K[this.config.metric??"co2"],e=this.tiles(),r=Math.max(1,Math.min(6,this.config.columns??3));return l`
      <ha-card>
        <div class="head">
          <ha-icon icon=${t.icon}></ha-icon>
          ${this.config.title??t.label}
        </div>
        ${e.length===0?l`<div class="empty">No peripheral sensors reporting.</div>`:l`
              <div
                class="grid"
                style=${`grid-template-columns:repeat(${r},minmax(0,1fr))`}
              >
                ${e.map(n=>l`
                    <div
                      class="tile"
                      role="button"
                      tabindex="0"
                      @click=${()=>this.open(n.entityId)}
                      @keydown=${a=>a.key==="Enter"&&this.open(n.entityId)}
                    >
                      <span class="name" title=${n.name}>${n.name}</span>
                      <span class="value">
                        ${ki(n.value,t.digits)}
                        <span class="unit">${t.unit}</span>
                      </span>
                    </div>
                  `)}
              </div>
            `}
      </ha-card>
    `}};kt.properties={hass:{attribute:!1},config:{state:!0}},kt.styles=[P,A`
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 1rem;
        font-weight: 600;
      }

      .grid {
        display: grid;
        gap: 8px;
      }

      /* Same geometry as the shared readout pill, at tile scale. */
      .tile {
        background: var(--futura-panel);
        border-radius: ${u(_.pill)};
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }

      .tile .name {
        font-size: 0.75rem;
        color: var(--futura-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tile .value {
        font-size: 1.35rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .tile .value .unit {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--futura-muted);
      }

      .empty {
        color: var(--futura-muted);
        font-size: 0.9rem;
      }
    `];var At=class extends w{constructor(){super(...arguments);this.config={type:"custom:futura-history-card"};this.signature=""}setConfig(t){if(!t)throw new Error("Missing configuration");let e=t.metric??"co2";if(!(e in K))throw new Error(`metric must be one of ${Object.keys(K).join(", ")}`);this.config={metric:e,hours_to_show:48,...t},this.signature="",this.inner=void 0}getCardSize(){return 4}static getStubConfig(){return{type:"custom:futura-history-card",metric:"co2"}}get metric(){return this.config.metric??"co2"}get chartTitle(){return this.config.title??`${K[this.metric].label} per sensor`}async sync(t){let e=t.join(",");if(e===this.signature&&this.inner){this.inner.hass=this.hass;return}let r=await window.loadCardHelpers?.();if(!r)return;this.signature=e;let n=this.config.hours_to_show??48,a=K[this.metric],o=t.map(m=>({entity:m,name:ge(this.hass,m,this.metric)})),c={min_y_axis:a.min,max_y_axis:a.max,fit_y_data:!0},h=r.createCardElement(this.config.raw?{type:"history-graph",title:this.chartTitle,hours_to_show:n,entities:o,...c}:{type:"statistics-graph",title:this.chartTitle,days_to_show:Math.max(1,Math.ceil(n/24)),period:this.config.period??"5minute",stat_types:["mean"],chart_type:"line",entities:o,...c});h.hass=this.hass,this.inner=h,this.requestUpdate()}render(){let t=fe(this.hass,this.config.prefix??L,this.metric);return t.length?(this.sync(t),l`${this.inner??p}`):p}};At.properties={hass:{attribute:!1},config:{state:!0}},At.styles=[P,A`
      ha-card {
        background: none;
        border: none;
        box-shadow: none;
        padding: 0;
      }
    `];var qt={bodyW:995,bodyH:835,pitch:243,firstCentre:133};function Ct(s,i=560,t=170){let e=i/qt.bodyW,r=Math.round(i*.011),n={x:t,y:s,w:i,h:Math.round(qt.bodyH*e),r:22};return{body:n,collarX:[0,1,2,3].map(a=>Math.round(t+(qt.firstCentre+a*qt.pitch)*e)),collarW:Math.round(qt.pitch*e)-r,collarH:30,lidH:Math.round(n.h*.26)}}function Ri(s){return f`
    ${s.collarX.map(i=>f`
      <rect x=${i-s.collarW/2} y=${s.body.y-s.collarH}
            width=${s.collarW} height=${s.collarH*2} rx="8"
            fill=${k.collar} />
    `)}
  `}function Mi(s,i){let{x:t,y:e,w:r,h:n,r:a}=s.body;return f`
    <rect x=${t} y=${e} width=${r} height=${n} rx=${a} fill=${k.casing} />
    ${Yt(s.body,e+s.lidH,i)}
  `}function Yt(s,i,t){let{x:e,y:r,w:n,h:a,r:o}=s,c=7,h=Math.min(12,Math.round(a*.035)),m=o-c,d=r+o-Math.sqrt(Math.max(0,o*o-m*m));return f`
    <path d=${`M ${e+c} ${d} L ${e+c} ${i-h} Q ${e+c} ${i} ${e+c+h} ${i} L ${e+n-c-h} ${i} Q ${e+n-c} ${i} ${e+n-c} ${i-h} L ${e+n-c} ${d}`}
          fill="none" stroke=${k.seam} stroke-width=${t} />
  `}function Zt(s,i,t=0){let e=Math.max(t,.5),r=Math.max(e,s-e),n=Math.max(1,Math.round(r/i));return(r/n).toFixed(3)}function Li(s,i,t,e,r,n,a,o){let c=($,v,R,M,z)=>{let x=1-$;return x*x*x*v+3*x*x*$*R+3*x*$*$*M+$*$*$*z},h=0,m=s,d=i;for(let $=1;$<=64;$+=1){let v=$/64,R=c(v,s,t,r,a),M=c(v,i,e,n,o);h+=Math.hypot(R-m,M-d),m=R,d=M}return h}var Di=900,Ar=1140,be={y:110,h:Ar-110},Et=Ct(650,560,170),y=Et.body,W=Et.collarX,we=Math.round(y.w*.0361),Pi=Math.round(we*1.95),ct={x:y.x+Math.round(y.w*.501),top:y.y+Math.round(y.h*.481),bottom:y.y+Math.round(y.h*.967),w:Math.max(4,Math.round(y.w*.016)),colour:k.led},ve={jablotronY:y.y+Math.round(y.h*.42),jablotronSize:Math.round(y.h*.0267/.72),futuraY:y.y+Math.round(y.h*.9),futuraSize:Math.round(y.h*.024/.72)},Cr=20,xe=[{flange:"A",label:"Outside air",temp:"outside_air_temperature",humidity:"outside_air_humidity",colour:b.outside,collar:0,row:0},{flange:"B",label:"Waste air",temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity",colour:b.waste,collar:1,row:1},{flange:"C",label:"Fresh air",temp:"supply_air_temperature",humidity:"supply_air_humidity",colour:b.fresh,collar:2,row:0},{flange:"D",label:"Inside air",temp:"extract_air_temperature",humidity:"extract_air_humidity",colour:b.inside,collar:3,row:1}],Ni=[150,330],lt=class lt extends w{constructor(){super(...arguments);this.config={type:"custom:futura-unit-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 8}static getStubConfig(){return{type:"custom:futura-unit-card"}}get entityPrefix(){return this.config.prefix??L}reading(t){return D(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}ductPill(t){let e=W[t.collar];return l`
      <div
        class="pill"
        style=${`left:${e/Di*100}%;top:${(Ni[t.row]-be.y)/be.h*100}%`}
      >
        <span class="name">${t.label}</span>
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${t.colour}`}></ha-icon>
          ${lt.decimal(this.reading(t.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${lt.decimal(this.reading(t.humidity),0)} %
        </span>
      </div>
    `}static duct(t){let e=W[t.collar],r=Ni[t.row]+Cr,n=y.y+10;return f`
      <path d=${`M ${e} ${r} L ${e} ${n}`}
            fill="none" stroke=${t.colour} stroke-width=${we}
            stroke-linecap="round"
            stroke-dasharray=${`0 ${Zt(n-r,Pi)}`} />
    `}static interior(){let t=y.y+we/2,e=(n,a)=>{let o=Math.abs(W[a]-W[n])/2,c=W[a]>W[n]?0:1;return`M ${W[n]} ${t} A ${o} ${o} 0 0 ${c} ${W[a]} ${t}`},r=(n,a)=>Zt(Math.PI*Math.abs(W[a]-W[n])/2,Pi);return f`
      <g stroke-width=${we} fill="none" opacity="0.34" stroke-linecap="round">
        <path d=${e(0,2)} stroke=${xe[0].colour}
              stroke-dasharray=${`0 ${r(0,2)}`} />
        <path d=${e(3,1)} stroke=${xe[3].colour}
              stroke-dasharray=${`0 ${r(3,1)}`} />
      </g>
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <svg viewBox="0 ${be.y} ${Di} ${be.h}" role="img"
               aria-label="Ventilation unit, duct temperatures and humidity">
            <!-- collars first, then the runs over them: the dots land on the
                 collar as they do on the app's screen. The casing comes after
                 both and hides whatever crosses its edge. -->
            ${W.map(e=>f`
              <rect x=${e-Et.collarW/2} y=${y.y-Et.collarH}
                    width=${Et.collarW} height=${Et.collarH*2} rx="8"
                    fill=${k.collar} />
            `)}
            ${xe.map(e=>lt.duct(e))}

            <rect x=${y.x} y=${y.y} width=${y.w} height=${y.h}
                  rx=${y.r} fill=${k.casing} />
            <!-- the filter hatch, a fifth of the way down the casing -->
            ${Yt(y,y.y+y.h*.2,U)}
            ${lt.interior()}
            <text x=${y.x+y.w/2} y=${ve.jablotronY}
                  text-anchor="middle" font-size=${ve.jablotronSize}
                  font-weight="700" letter-spacing="1.6"
                  fill=${k.wordmark}>JABLOTRON</text>
            <text x=${y.x+y.w-28} y=${ve.futuraY}
                  text-anchor="end" font-size=${ve.futuraSize}
                  letter-spacing="1.4" fill=${k.wordmarkDim}>FUTURA</text>
            <!-- the status LED down the centre of the lower panel -->
            <rect x=${ct.x-ct.w/2} y=${ct.top} width=${ct.w}
                  height=${ct.bottom-ct.top} rx=${ct.w/2}
                  fill=${ct.colour} />
          </svg>
          ${xe.map(e=>this.ductPill(e))}
        </div>
      </ha-card>
    `:l`<ha-card>${O(`Entity ${t} not found.`)}</ha-card>`}};lt.properties={hass:{attribute:!1},config:{state:!0}},lt.styles=[P,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${u(I)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${u(_.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${u(B)};
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
        font-family: inherit;
      }

      /* The drawing and the pills share one box, so a pill can be placed by
         percentage and stay put: the SVG's viewBox fixes the aspect, so the
         box's height always tracks its width. */
      .stage {
        position: relative;
      }

      /*
       * HTML rather than SVG: 13px radius, a 1px hairline at 20% white,
       * 12px/500 text at 92%, a 13px icon. As HTML these are the same size on
       * screen as the other cards' pills, whatever width the card is given.
       *
       * The ground is opaque: over a duct, a translucent pill let the run
       * behind the label show through.
       */
      .pill {
        position: absolute;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 6px 10px 7px;
        border-radius: 13px;
        background: rgb(12, 14, 18);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 12px;
        font-weight: 500;
        line-height: 1.35;
        color: rgba(255, 255, 255, 0.92);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        pointer-events: none;
      }

      .pill .name {
        color: rgba(255, 255, 255, 0.6);
      }

      .pill .row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .pill ha-icon {
        --mdc-icon-size: 13px;
        opacity: 0.75;
        flex: none;
      }
    `];var _e=lt;var Ui=900,Er=14,Oi={top:84,bottom:162},C=Ct(196),Ii=C.body.y+C.body.h+18,Jt=Math.round(C.body.w*.027),Sr=Math.round(Jt*2.2),Hi=[{flange:"A",temp:"outside_air_temperature",humidity:"outside_air_humidity",colour:b.outside,collar:0,into:!0},{flange:"B",temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity",colour:b.waste,collar:1,into:!1},{flange:"C",temp:"supply_air_temperature",humidity:"supply_air_humidity",colour:b.fresh,collar:2,into:!1},{flange:"D",temp:"extract_air_temperature",humidity:"extract_air_humidity",colour:b.inside,collar:3,into:!0}];function Wi(s,i){let t=e=>({x:s.x+(i.x-s.x)*e,y:s.y+(i.y-s.y)*e});return{c1:t(1/3),c2:t(2/3),end:i}}function Tr(s){return`M ${s.start.x} ${s.start.y}`+s.segments.map(i=>` C ${i.c1.x} ${i.c1.y}, ${i.c2.x} ${i.c2.y}, ${i.end.x} ${i.end.y}`).join("")}function Rr(s){let i=s.start,t=0;for(let e of s.segments)t+=Li(i.x,i.y,e.c1.x,e.c1.y,e.c2.x,e.c2.y,e.end.x,e.end.y),i=e.end;return t}var X=class X extends w{constructor(){super(...arguments);this.config={type:"custom:futura-schematic-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 7}static getStubConfig(){return{type:"custom:futura-schematic-card"}}get entityPrefix(){return this.config.prefix??L}reading(t){return D(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}label(t){let e=C.collarX[t.collar];return l`
      <div
        class="reading"
        style=${`left:${e/Ui*100}%; top:${Er/Ii*100}%`}
      >
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${t.colour}`}></ha-icon>
          ${X.decimal(this.reading(t.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${X.decimal(this.reading(t.humidity),0)} %
        </span>
      </div>
    `}static arrow(t){let e=C.collarX[t.collar],r=Math.round(C.body.w*.019),n=Math.round(C.body.w*.047),{top:a,bottom:o}=Oi,c=t.into?o:a,h=t.into?a:o,m=t.into?c-n:c+n,d=`M ${e-r} ${h} L ${e-r} ${m} L ${e-n} ${m} L ${e} ${c} L ${e+n} ${m} L ${e+r} ${m} L ${e+r} ${h} Z`;return f`<path d=${d} fill=${t.colour} />`}static house(){let t=(C.collarX[2]+C.collarX[3])/2,e=Oi.bottom-26,r=26;return f`
      <path d=${`M ${t-r} ${e} L ${t} ${e-r*.8} L ${t+r} ${e} M ${t-r*.72} ${e-3} L ${t-r*.72} ${e+r*.62} L ${t+r*.72} ${e+r*.62} L ${t+r*.72} ${e-3}`}
            fill="none" stroke=${k.dim} stroke-width="3.4"
            stroke-linecap="round" stroke-linejoin="round" />
    `}filter(){let{x:t,y:e,w:r}=C.body,n=Math.round(r*.4),a=t+(r-n)/2,o=e+24,c=C.lidH-48,h=this.reading("filter_clogging");return f`
      <rect x=${a} y=${o} width=${n} height=${c} rx="10"
            fill=${k.panel} stroke=${k.panelEdge} stroke-width=${U} />
      <text x=${a+n/2} y=${o+c*.44} text-anchor="middle"
            font-size="23" font-weight="700" fill=${k.ink}>
        ${h===void 0?"--":Math.round(h)} %
      </text>
      <text x=${a+n/2} y=${o+c*.82} text-anchor="middle"
            font-size="16" fill=${k.dim}>Filter</text>
    `}static streams(){let{x:t,y:e,w:r,h:n}=C.body,a=e+C.lidH+18,o=e+Math.round(n*.93),c=t+r/2,h=Math.round(r*.055),m=Math.round(r*.2),d=(M,z)=>{let x=C.collarX[M],F=C.collarX[z],G=Math.sign(F-x),Z=x+G*m,Dt=.5523*h;return{start:{x,y:a},segments:[Wi({x,y:a},{x,y:o-h}),{c1:{x,y:o-h+Dt},c2:{x:x+G*(h-Dt),y:o},end:{x:x+G*h,y:o}},Wi({x:x+G*h,y:o},{x:Z,y:o}),{c1:{x:Z+(F-Z)*.22,y:o},c2:{x:F,y:a+(o-a)*.4},end:{x:F,y:a}}]}},$=Math.round(r*.11),v=(M,z,x,F)=>f`
      <linearGradient id=${M} gradientUnits="userSpaceOnUse"
                      x1=${z} y1="0" x2=${x} y2="0">
        ${F.map((G,Z)=>f`
          <stop offset=${`${Z/(F.length-1)*100}%`} stop-color=${G} />
        `)}
      </linearGradient>
    `,R=[{leg:d(0,2),stream:"supply"},{leg:d(3,1),stream:"extract"}];return f`
      <defs>
        <!-- outdoor air enters left of the exchanger, supply leaves to its right -->
        ${v("futura-stream-supply",c-$,c+$,Bt)}
        <!-- extract enters right of it, waste leaves to its left -->
        ${v("futura-stream-extract",c+$,c-$,vt)}
      </defs>
      <g fill="none" stroke-width=${Jt} stroke-linecap="butt" opacity="0.82">
        ${R.map(({leg:M,stream:z})=>{let x=Number(Zt(Rr(M),Sr,Jt));return f`
            <path d=${Tr(M)} stroke=${`url(#futura-stream-${z})`}
                  stroke-dasharray=${`${Jt} ${x-Jt}`} />
          `})}
      </g>
    `}fans(){let{y:t,h:e}=C.body,r=t+Math.round(e*.735),n=(a,o,c,h,m)=>f`
      <text x=${a} y=${r} text-anchor=${o} font-size="17" fill=${k.fainter}>
        ${c}
      </text>
      <text x=${a} y=${r+27} text-anchor=${o}
            font-size="24" font-weight="700" fill=${k.ink}>
        ${h===void 0?"--":Math.round(h)} %
      </text>
      <text x=${a} y=${r+51} text-anchor=${o} font-size="18" fill=${k.dim}>
        ${m===void 0?"--":Math.round(m)} rpm
      </text>
    `;return f`
      ${n(C.collarX[0]+34,"start","Supply",this.reading("supply_fan_output"),this.reading("supply_fan_speed"))}
      ${n(C.collarX[3]-34,"end","Exhaust",this.reading("exhaust_fan_output"),this.reading("exhaust_fan_speed"))}
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <svg viewBox="0 0 ${Ui} ${Ii}" role="img"
               aria-label="Ventilation unit: duct readings, fans and filter">
            ${Hi.map(e=>X.arrow(e))}
            ${X.house()}
            ${Ri(C)}
            ${Mi(C,U)}
            ${X.streams()}
            ${this.filter()}
            ${this.fans()}
          </svg>
          ${Hi.map(e=>this.label(e))}
        </div>
      </ha-card>
    `:l`<ha-card>${O(`Entity ${t} not found.`)}</ha-card>`}};X.properties={hass:{attribute:!1},config:{state:!0}},X.styles=[P,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${u(I)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${u(_.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${u(B)};
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
        /*
         * Named rather than inherited. The SVG text here is the only type on the
         * card that is not an HTML pill, and an inherit that resolves to
         * nothing lands on the UA serif.
         */
        font-family: var(--paper-font-body1_-_font-family, Roboto, system-ui, sans-serif);
      }

      .stage {
        position: relative;
        /* So the labels can size against the drawing rather than the viewport. */
        container-type: inline-size;
      }

      /*
       * The duct readings, in the readout pill's type but without the pill: the
       * reference sets these as bare text over the background, and a pill per
       * duct would crowd four of them across the top.
       *
       * 12px matches the pills on the other cards, but it cannot be a flat 12px:
       * these four sit over the flanges, which are 15.2% of the width apart, while
       * the label needs about 5.2em -- so below roughly 410px the neighbours
       * collide and the rightmost runs off the card. 2.9cqw is the width at which
       * a label exactly fills its flange's share, so the min() holds 12px wherever
       * there is room and scales the whole block down in proportion where there is
       * not. Everything inside is in em so it scales as one piece.
       */
      .reading {
        position: absolute;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        gap: 0.1em;
        font-size: min(12px, 2.9cqw);
        font-weight: 500;
        line-height: 1.3;
        color: rgba(255, 255, 255, 0.92);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        pointer-events: none;
      }

      .reading .row {
        display: flex;
        align-items: center;
        gap: 0.4em;
      }

      .reading ha-icon {
        --mdc-icon-size: 1.08em;
        opacity: 0.75;
        flex: none;
      }
    `];var ke=X;var Fi=900,j=Ct(124,560,170),g=j.body,Mr=g.y+g.h+22,St=g.y+Math.round(g.h*.047),q=g.y+Math.round(g.h*.905),S={y:g.y+Math.round(g.h*.147),r:Math.round(g.w*.042)},Tt=g.y+Math.round(g.h*.347),zi=Math.round(g.h*.084),Lr={top:22,bottom:78},Rt=k.line,N={flow:.95,shell:.8,detail:.3,label:.75},Dr={top:g.y+Math.round(g.h*.711),mid:g.y+Math.round(g.h*.821),bottom:g.y+Math.round(g.h*.937),point:Math.round(g.w*.145),shoulder:Math.round(g.w*.073)},Pr=[.13,.532,.764].map(s=>g.y+Math.round(g.h*s)),Ae=Math.round(g.w*.027),T={dx:Math.round(g.w*.082),dy:Math.round(g.h*.056),wing:Math.round(g.w*.025)},Nr=`${(j.collarX[0]-(j.collarX[1]-j.collarX[0])/2)/Fi*100}%`,Ze=[{flange:"A",collar:0,into:!0,colour:b.outside,temp:"outside_air_temperature",humidity:"outside_air_humidity"},{flange:"B",collar:1,into:!1,colour:b.waste,temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity"},{flange:"C",collar:2,into:!1,colour:b.fresh,temp:"supply_air_temperature",humidity:"supply_air_humidity"},{flange:"D",collar:3,into:!0,colour:b.inside,temp:"extract_air_temperature",humidity:"extract_air_humidity"}],E=class E extends w{constructor(){super(...arguments);this.config={type:"custom:futura-diagram-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 8}static getStubConfig(){return{type:"custom:futura-diagram-card"}}get entityPrefix(){return this.config.prefix??L}reading(t){return D(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}pill(t){return l`
      <div class="pill readout-pill">
        <span class="row">
          <ha-icon icon="mdi:thermometer"></ha-icon>
          ${E.decimal(this.reading(t.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${E.decimal(this.reading(t.humidity),0)} %
        </span>
      </div>
    `}static arrow(t){let e=j.collarX[t.collar],{top:r,bottom:n}=Lr,a=t.into?n:r,o=t.into?r:n,c=t.into?-1:1,h=Math.round(g.w*.022);return f`
      <path d=${`M ${e} ${o} L ${e} ${a} M ${e-h} ${a+c*h*1.3} L ${e} ${a} L ${e+h} ${a+c*h*1.3}`}
            fill="none" stroke=${t.colour} stroke-width=${xt}
            stroke-opacity=${N.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static casing(){let{x:t,y:e,w:r,h:n}=g,a=e+j.lidH;return f`
      <g fill="none" stroke=${Rt} stroke-linecap="round" stroke-linejoin="round">
        ${j.collarX.map(o=>f`
          <rect x=${o-j.collarW/2} y=${e-zi}
                width=${j.collarW} height=${zi}
                stroke-width=${ft} stroke-opacity=${N.shell} />
        `)}
        <rect x=${t} y=${e} width=${r} height=${n} rx=${g.r}
              stroke-width=${U} stroke-opacity=${N.shell} />
        <path d=${`M ${t+9} ${e+20} L ${t+9} ${e+44} M ${t+r-9} ${e+20} L ${t+r-9} ${e+44}`}
              stroke-width=${me} stroke-opacity=${N.detail} />
        ${Yt(g,a,ft)}
      </g>
    `}static fan(t,e,r){let{r:n}=S,a=n*.62,o=e?S.y-a:S.y+a,c=e?S.y+a*.72:S.y-a*.72;return f`
      <circle cx=${t} cy=${S.y} r=${n} fill=${I}
              stroke=${Rt} stroke-width=${ft} stroke-opacity=${N.shell} />
      <path d=${`M ${t-a} ${c} L ${t+a} ${c} L ${t} ${o} Z`}
            fill=${r} fill-opacity=${N.flow} />
    `}static head(t,e,r,n,a,o=Math.round(g.w*.019),c=xt){let h=Math.hypot(r,n)||1,m=r/h,d=n/h,$=t-m*o*1.3,v=e-d*o*1.3;return f`
      <path d=${`M ${$-d*o} ${v+m*o} L ${t} ${e} L ${$+d*o} ${v-m*o}`}
            fill="none" stroke=${a} stroke-width=${c}
            stroke-opacity=${N.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static chevrons(t,e,r,n){let a=r>e,o=Math.round(g.w*.02),c=Math.min(e,r)+o,h=Math.max(e,r)-o,m=Pr.filter(d=>d>=c&&d<=h);return f`
      <path d=${m.map(d=>`M ${t-o} ${d-(a?o:-o)} L ${t} ${d} L ${t+o} ${d-(a?o:-o)}`).join(" ")}
            fill="none" stroke=${n} stroke-width=${xt}
            stroke-opacity=${N.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static flow(){let[t,e,r,n]=j.collarX,{top:a,mid:o,bottom:c,point:h,shoulder:m}=Dr,d=g.x+g.w/2,$=d-h,v=d+h,R=d-m,M=d+m,z=(Q,tt,Qe,Gi,Vi)=>Qe+(Q-tt)/(Gi-tt)*(Vi-Qe),x=(Q,tt)=>Q+(tt-Q)*(q-o)/(c-o),F=z(e,$,o,R,a)-Ae,G=z(r,v,o,M,a)-Ae,Z=x($,R)-Ae,Dt=x(v,M)+Ae,Qt=Math.round(g.w*.026),Pt=(e+r)/2,te=(Q,tt)=>f`
      <circle cx=${Q} cy=${Tt} r=${xt*1.4}
              fill=${tt} fill-opacity=${N.flow} />
    `,J=(Q,tt)=>f`
      <path d=${Q} fill="none" stroke=${tt} stroke-width=${xt}
            stroke-opacity=${N.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `,[gt,Je,ht,Nt]=Ze;return f`
      <!-- A: outdoor air down and into the exchanger -->
      ${J(`M ${t} ${St} L ${t} ${q} L ${Z} ${q}`,gt.colour)}
      <!-- B: waste up from the exchanger's upper-left slant -->
      ${J(`M ${e} ${F} L ${e} ${St}`,Je.colour)}
      <!-- C: supply up through its fan -->
      ${J(`M ${r} ${G} L ${r} ${S.y+S.r}`,ht.colour)}
      ${J(`M ${r} ${S.y-S.r} L ${r} ${St}`,ht.colour)}
      <!-- D: extract down through its fan and into the exchanger -->
      ${J(`M ${n} ${St} L ${n} ${S.y-S.r}`,Nt.colour)}
      ${J(`M ${n} ${S.y+S.r} L ${n} ${q} L ${Dt} ${q}`,Nt.colour)}

      <!--
        The bypass, taking outdoor air straight to supply past the exchanger. Two
        colours, changing at the damper: what is upstream of it is still outdoor
        air, what is downstream of it is supply.
      -->
      ${J(`M ${t} ${Tt} L ${Pt-Qt} ${Tt}`,gt.colour)}
      ${J(`M ${Pt+Qt} ${Tt} L ${r} ${Tt}`,ht.colour)}
      ${te(t,gt.colour)}
      ${te(Pt-Qt,gt.colour)}
      ${te(Pt+Qt,ht.colour)}
      ${te(r,ht.colour)}
      <text x=${Pt} y=${Tt+Math.round(g.w*.048)}
            text-anchor="middle" font-size=${Math.round(g.w*.027)}
            letter-spacing="1.1" fill=${Rt} fill-opacity=${N.label}>BYPASS</text>

      <!-- the exchanger, and the crossing that names it -->
      <g fill="none" stroke=${Rt} stroke-linecap="round" stroke-linejoin="round">
        <path d=${`M ${$} ${o} L ${R} ${a} L ${M} ${a} L ${v} ${o} L ${M} ${c} L ${R} ${c} Z`}
              stroke-width=${U} stroke-opacity=${N.shell} />
        <path d=${`M ${d-T.dx} ${o+T.dy} L ${d+T.dx} ${o-T.dy} M ${d+T.dx} ${o+T.dy} L ${d-T.dx} ${o-T.dy}`}
              stroke-width=${ft} stroke-opacity=${N.shell} />
      </g>
      <!--
        The cross's heads at the cross's own weight. Left at the runs' pipe weight
        they read bolder than the arms they belong to, which made a correctly
        proportioned head look oversized.
      -->
      <g stroke-opacity=${N.shell}>
        ${E.head(d+T.dx,o-T.dy,T.dx,-T.dy,Rt,T.wing,ft)}
        ${E.head(d-T.dx,o-T.dy,-T.dx,-T.dy,Rt,T.wing,ft)}
      </g>

      <!-- direction marks: the legs in, the two runs out, and the chevrons -->
      ${E.head(Z,q,1,0,gt.colour)}
      ${E.head(Dt,q,-1,0,Nt.colour)}
      <!--
        No arrowhead where a run leaves the unit. The block arrow above its collar
        already says which way that duct flows, so a head just inside the casing
        repeated it a few units lower down.
      -->
      ${E.chevrons(t,St,q,gt.colour)}
      ${E.chevrons(e,F,St,Je.colour)}
      ${E.chevrons(r,G,S.y+S.r,ht.colour)}
      ${E.chevrons(n,S.y+S.r,q,Nt.colour)}

      ${E.fan(r,!0,ht.colour)}
      ${E.fan(n,!1,Nt.colour)}
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <div class="labels">${Ze.map(e=>this.pill(e))}</div>
          <svg viewBox="0 0 ${Fi} ${Mr}" role="img"
               aria-label="Ventilation unit airflow diagram with duct readings">
            ${Ze.map(e=>E.arrow(e))}
            ${E.casing()}
            ${E.flow()}
          </svg>
        </div>
      </ha-card>
    `:l`<ha-card>${O(`Entity ${t} not found.`)}</ha-card>`}};E.properties={hass:{attribute:!1},config:{state:!0}},E.styles=[P,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${u(I)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${u(_.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${u(B)};
      }

      svg {
        width: 100%;
        height: auto;
        display: block;
      }

      .stage {
        /* So the pills can size against the drawing rather than the viewport. */
        container-type: inline-size;
      }

      .labels {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        padding: 14px ${u(Nr)} 8px;
      }

      /*
       * One pill per flange, centred in its column. 12px matches every other
       * readout, but it cannot be a flat 12px: a column is 19% of the width and a
       * pill needs about 6.1em, so below roughly 415px the neighbours would touch
       * and the grid would push them off their flanges. 2.9cqw is the width at
       * which a pill fits its column with a little slack, so the min() holds 12px
       * wherever there is room and scales in proportion where there is not.
       */
      .pill {
        justify-self: center;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.15em;
        font-size: min(12px, 2.9cqw);
        line-height: 1.25;
        white-space: nowrap;
        pointer-events: none;
      }

      .pill .row {
        gap: 0.42em;
      }

      .pill ha-icon {
        --mdc-icon-size: 1.08em;
      }
    `];var Ce=E;var Y={flow:{option:"Air flow",tag:"futura-flow-card",label:"Air flow (app screen)",hint:"The mobile app's air-quality screen: glowing ribbons, air quality and filter."},unit:{option:"Unit schematic",tag:"futura-unit-card",label:"Unit schematic",hint:"The casing at its real proportions, one full-bore duct per flange."},service:{option:"Service schematic",tag:"futura-schematic-card",label:"Service schematic",hint:"Flow direction per duct, both fan speeds, filter wear."},diagram:{option:"Airflow diagram",tag:"futura-diagram-card",label:"Airflow diagram (line drawing)",hint:"The manual's process diagram: runs, bypass, fans and the exchanger."}},Ee="flow",Mt=class Mt extends w{constructor(){super(...arguments);this.config={type:"custom:futura-schematics-card"}}set hass(t){let e=this.variant;if(this._hass=t,this.variant!==e){this.child=void 0,this.requestUpdate();return}this.child&&(this.child.hass=t)}get hass(){return this._hass}setConfig(t){if(!t)throw new Error("Missing configuration");let e=t.variant??Ee;if(!(e in Y))throw new Error(`Unknown variant "${e}". Pick one of: ${Object.keys(Y).join(", ")}.`);this.config={...t},this.child=void 0}static getStubConfig(){return{type:"custom:futura-schematics-card",variant:Ee}}static getConfigElement(){return document.createElement("futura-schematics-card-editor")}static match(t){let e=t.toLowerCase().replace(/[^a-z]/g,"");return Object.keys(Y).find(r=>r===e||Y[r].option.toLowerCase().replace(/[^a-z]/g,"")===e)}get variant(){return this.selected??this.config.variant??Ee}get helperState(){let t=this.config.variant_entity;return t?this._hass?.states[t]?.state:void 0}get selected(){let t=this.helperState;if(!(t===void 0||t==="unavailable"||t==="unknown"))return Mt.match(t)}get unmatched(){let t=this.config.variant_entity;if(!t)return;let e=this.helperState;if(e===void 0)return`Entity ${t} not found.`;if(!(e==="unavailable"||e==="unknown")&&!Mt.match(e))return`${t} is "${e}", which is not one of: ${Object.values(Y).map(r=>r.option).join(", ")}.`}getCardSize(){return this.child?.getCardSize?.()??7}get card(){let{tag:t}=Y[this.variant];if(customElements.get(t)){if(!this.child){let{type:e,variant:r,variant_entity:n,...a}=this.config,o=document.createElement(t);o.setConfig({type:`custom:${t}`,...a}),o.hass=this._hass,this.child=o}return this.child}}render(){let t=this.unmatched;if(t)return l`<ha-card>${O(t)}</ha-card>`;let e=this.card;return e?l`${e}`:l`<ha-card>
        ${O(`Card ${Y[this.variant].tag} is not registered.`)}
      </ha-card>`}};Mt.properties={hass:{attribute:!1},config:{state:!0}},Mt.styles=A`
    :host {
      display: block;
    }
  `;var Se=Mt,Lt=class Lt extends w{constructor(){super(...arguments);this.config={type:"custom:futura-schematics-card"}}setConfig(t){this.config={...t}}static get schema(){return[{name:"variant",selector:{select:{mode:"dropdown",options:Object.entries(Y).map(([t,e])=>({value:t,label:e.label}))}}},{name:"variant_entity",selector:{entity:{domain:["input_select","select"]}}},{name:"prefix",selector:{text:{}}},{name:"title",selector:{text:{}}}]}static label(t){return{variant:"Schematic",variant_entity:"Or choose it from this helper",prefix:"Entity prefix",title:"Card title"}[t.name]??t.name}changed(t){t.stopPropagation();let e={...this.config,...t.detail.value};for(let r of["prefix","title","variant_entity"])e[r]===""&&delete e[r];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){let t=this.config.variant??Ee;return l`
      <ha-form
        .hass=${this.hass}
        .data=${{variant:t,...this.config}}
        .schema=${Lt.schema}
        .computeLabel=${Lt.label}
        @value-changed=${this.changed}
      ></ha-form>
      <div class="hint">${Y[t]?.hint}</div>
    `}};Lt.properties={hass:{attribute:!1},config:{state:!0}},Lt.styles=A`
    .hint {
      padding: 8px 4px 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `;var Te=Lt;var ji=[{type:"futura-flow-card",name:"Futura air flow",description:"Airflow schematic with duct temperatures, humidity, recovered heat and filter status.",preview:!0,element:$e},{type:"futura-control-card",name:"Futura controls",description:"Ventilation level, temperature target and timed functions.",preview:!0,element:_t},{type:"futura-sensor-grid-card",name:"Futura sensor grid",description:"CO\u2082, temperature or humidity tiles for every connected peripheral.",preview:!0,element:kt},{type:"futura-history-card",name:"Futura sensor history",description:"History graph of CO\u2082, temperature or humidity across every connected peripheral.",preview:!0,element:At},{type:"futura-unit-card",name:"Futura unit schematic",description:"The unit and its four ducts, with each duct's temperature and humidity and the current operating mode.",preview:!0,element:_e},{type:"futura-schematic-card",name:"Futura service schematic",description:"The unit with airflow direction, per-duct readings, both fan speeds and filter wear -- the service view.",preview:!0,element:ke},{type:"futura-diagram-card",name:"Futura airflow diagram",description:"The manual's airflow diagram as a line drawing: runs, bypass, both fans and the exchanger.",preview:!0,element:Ce},{type:"futura-schematics-card",name:"Futura schematic (pick one)",description:"Any one of the four views of the unit, chosen in the card's settings.",preview:!0,element:Se}];customElements.get("futura-schematics-card-editor")||customElements.define("futura-schematics-card-editor",Te);var Bi=window.customCards||=[];for(let s of ji)if(customElements.get(s.type)||customElements.define(s.type,s.element),!Bi.some(i=>i.type===s.type)){let{element:i,...t}=s;Bi.push(t)}console.info(`%c FUTURA-CARDS %c ${ji.length} cards registered `,`background:${de};color:${bt}`,"");export{_t as FuturaControlCard,Ce as FuturaDiagramCard,$e as FuturaFlowCard,At as FuturaHistoryCard,ke as FuturaSchematicCard,Se as FuturaSchematicsCard,Te as FuturaSchematicsCardEditor,kt as FuturaSensorGridCard,_e as FuturaUnitCard};
