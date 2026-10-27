/* Jablotron Futura Lovelace cards - generated, do not edit */
var ie=globalThis,re=ie.ShadowRoot&&(ie.ShadyCSS===void 0||ie.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Re=Symbol(),ii=new WeakMap,Ht=class{constructor(i,t,e){if(this._$cssResult$=!0,e!==Re)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=i,this.t=t}get styleSheet(){let i=this.o,t=this.t;if(re&&i===void 0){let e=t!==void 0&&t.length===1;e&&(i=ii.get(t)),i===void 0&&((this.o=i=new CSSStyleSheet).replaceSync(this.cssText),e&&ii.set(t,i))}return i}toString(){return this.cssText}},ne=s=>new Ht(typeof s=="string"?s:s+"",void 0,Re),A=(s,...i)=>{let t=s.length===1?s[0]:i.reduce((e,r,n)=>e+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[n+1],s[0]);return new Ht(t,s,Re)},ri=(s,i)=>{if(re)s.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of i){let e=document.createElement("style"),r=ie.litNonce;r!==void 0&&e.setAttribute("nonce",r),e.textContent=t.cssText,s.appendChild(e)}},Le=re?s=>s:s=>s instanceof CSSStyleSheet?(i=>{let t="";for(let e of i.cssRules)t+=e.cssText;return ne(t)})(s):s;var{is:Yi,defineProperty:Zi,getOwnPropertyDescriptor:Qi,getOwnPropertyNames:Ji,getOwnPropertySymbols:tr,getPrototypeOf:er}=Object,se=globalThis,ni=se.trustedTypes,ir=ni?ni.emptyScript:"",rr=se.reactiveElementPolyfillSupport,Ot=(s,i)=>s,Me={toAttribute(s,i){switch(i){case Boolean:s=s?ir:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,i){let t=s;switch(i){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},ai=(s,i)=>!Yi(s,i),si={attribute:!0,type:String,converter:Me,reflect:!1,useDefault:!1,hasChanged:ai};Symbol.metadata??=Symbol("metadata"),se.litPropertyMetadata??=new WeakMap;var X=class extends HTMLElement{static addInitializer(i){this._$Ei(),(this.l??=[]).push(i)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(i,t=si){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(i)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(i,t),!t.noAccessor){let e=Symbol(),r=this.getPropertyDescriptor(i,e,t);r!==void 0&&Zi(this.prototype,i,r)}}static getPropertyDescriptor(i,t,e){let{get:r,set:n}=Qi(this.prototype,i)??{get(){return this[t]},set(a){this[t]=a}};return{get:r,set(a){let o=r?.call(this);n?.call(this,a),this.requestUpdate(i,o,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(i){return this.elementProperties.get(i)??si}static _$Ei(){if(this.hasOwnProperty(Ot("elementProperties")))return;let i=er(this);i.finalize(),i.l!==void 0&&(this.l=[...i.l]),this.elementProperties=new Map(i.elementProperties)}static finalize(){if(this.hasOwnProperty(Ot("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ot("properties"))){let t=this.properties,e=[...Ji(t),...tr(t)];for(let r of e)this.createProperty(r,t[r])}let i=this[Symbol.metadata];if(i!==null){let t=litPropertyMetadata.get(i);if(t!==void 0)for(let[e,r]of t)this.elementProperties.set(e,r)}this._$Eh=new Map;for(let[t,e]of this.elementProperties){let r=this._$Eu(t,e);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(i){let t=[];if(Array.isArray(i)){let e=new Set(i.flat(1/0).reverse());for(let r of e)t.unshift(Le(r))}else i!==void 0&&t.push(Le(i));return t}static _$Eu(i,t){let e=t.attribute;return e===!1?void 0:typeof e=="string"?e:typeof i=="string"?i.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(i=>this.enableUpdating=i),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(i=>i(this))}addController(i){(this._$EO??=new Set).add(i),this.renderRoot!==void 0&&this.isConnected&&i.hostConnected?.()}removeController(i){this._$EO?.delete(i)}_$E_(){let i=new Map,t=this.constructor.elementProperties;for(let e of t.keys())this.hasOwnProperty(e)&&(i.set(e,this[e]),delete this[e]);i.size>0&&(this._$Ep=i)}createRenderRoot(){let i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ri(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(i=>i.hostConnected?.())}enableUpdating(i){}disconnectedCallback(){this._$EO?.forEach(i=>i.hostDisconnected?.())}attributeChangedCallback(i,t,e){this._$AK(i,e)}_$ET(i,t){let e=this.constructor.elementProperties.get(i),r=this.constructor._$Eu(i,e);if(r!==void 0&&e.reflect===!0){let n=(e.converter?.toAttribute!==void 0?e.converter:Me).toAttribute(t,e.type);this._$Em=i,n==null?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(i,t){let e=this.constructor,r=e._$Eh.get(i);if(r!==void 0&&this._$Em!==r){let n=e.getPropertyOptions(r),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Me;this._$Em=r;let o=a.fromAttribute(t,n.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(i,t,e,r=!1,n){if(i!==void 0){let a=this.constructor;if(r===!1&&(n=this[i]),e??=a.getPropertyOptions(i),!((e.hasChanged??ai)(n,t)||e.useDefault&&e.reflect&&n===this._$Ej?.get(i)&&!this.hasAttribute(a._$Eu(i,e))))return;this.C(i,t,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(i,t,{useDefault:e,reflect:r,wrapped:n},a){e&&!(this._$Ej??=new Map).has(i)&&(this._$Ej.set(i,a??t??this[i]),n!==!0||a!==void 0)||(this._$AL.has(i)||(this.hasUpdated||e||(t=void 0),this._$AL.set(i,t)),r===!0&&this._$Em!==i&&(this._$Eq??=new Set).add(i))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let i=this.scheduleUpdate();return i!=null&&await i,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[r,n]of this._$Ep)this[r]=n;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[r,n]of e){let{wrapped:a}=n,o=this[r];a!==!0||this._$AL.has(r)||o===void 0||this.C(r,void 0,n,o)}}let i=!1,t=this._$AL;try{i=this.shouldUpdate(t),i?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(e){throw i=!1,this._$EM(),e}i&&this._$AE(t)}willUpdate(i){}_$AE(i){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(i)),this.updated(i)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(i){return!0}update(i){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(i){}firstUpdated(i){}};X.elementStyles=[],X.shadowRootOptions={mode:"open"},X[Ot("elementProperties")]=new Map,X[Ot("finalized")]=new Map,rr?.({ReactiveElement:X}),(se.reactiveElementVersions??=[]).push("2.1.2");var Ie=globalThis,oi=s=>s,ae=Ie.trustedTypes,ci=ae?ae.createPolicy("lit-html",{createHTML:s=>s}):void 0,mi="$lit$",it=`lit$${Math.random().toFixed(9).slice(2)}$`,fi="?"+it,nr=`<${fi}>`,mt=document,Ft=()=>mt.createComment(""),Wt=s=>s===null||typeof s!="object"&&typeof s!="function",Fe=Array.isArray,sr=s=>Fe(s)||typeof s?.[Symbol.iterator]=="function",De=`[ 	
\f\r]`,It=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,li=/-->/g,hi=/>/g,ut=RegExp(`>|${De}(?:([^\\s"'>=/]+)(${De}*=${De}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),di=/'/g,ui=/"/g,gi=/^(?:script|style|textarea|title)$/i,We=s=>(i,...t)=>({_$litType$:s,strings:i,values:t}),l=We(1),$=We(2),Vr=We(3),ft=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),pi=new WeakMap,pt=mt.createTreeWalker(mt,129);function $i(s,i){if(!Fe(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return ci!==void 0?ci.createHTML(i):i}var ar=(s,i)=>{let t=s.length-1,e=[],r,n=i===2?"<svg>":i===3?"<math>":"",a=It;for(let o=0;o<t;o++){let c=s[o],h,m,u=-1,g=0;for(;g<c.length&&(a.lastIndex=g,m=a.exec(c),m!==null);)g=a.lastIndex,a===It?m[1]==="!--"?a=li:m[1]!==void 0?a=hi:m[2]!==void 0?(gi.test(m[2])&&(r=RegExp("</"+m[2],"g")),a=ut):m[3]!==void 0&&(a=ut):a===ut?m[0]===">"?(a=r??It,u=-1):m[1]===void 0?u=-2:(u=a.lastIndex-m[2].length,h=m[1],a=m[3]===void 0?ut:m[3]==='"'?ui:di):a===ui||a===di?a=ut:a===li||a===hi?a=It:(a=ut,r=void 0);let w=a===ut&&s[o+1].startsWith("/>")?" ":"";n+=a===It?c+nr:u>=0?(e.push(h),c.slice(0,u)+mi+c.slice(u)+it+w):c+it+(u===-2?o:w)}return[$i(s,n+(s[t]||"<?>")+(i===2?"</svg>":i===3?"</math>":"")),e]},zt=class s{constructor({strings:i,_$litType$:t},e){let r;this.parts=[];let n=0,a=0,o=i.length-1,c=this.parts,[h,m]=ar(i,t);if(this.el=s.createElement(h,e),pt.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(r=pt.nextNode())!==null&&c.length<o;){if(r.nodeType===1){if(r.hasAttributes())for(let u of r.getAttributeNames())if(u.endsWith(mi)){let g=m[a++],w=r.getAttribute(u).split(it),M=/([.?@])?(.*)/.exec(g);c.push({type:1,index:n,name:M[2],strings:w,ctor:M[1]==="."?Ne:M[1]==="?"?Ue:M[1]==="@"?He:vt}),r.removeAttribute(u)}else u.startsWith(it)&&(c.push({type:6,index:n}),r.removeAttribute(u));if(gi.test(r.tagName)){let u=r.textContent.split(it),g=u.length-1;if(g>0){r.textContent=ae?ae.emptyScript:"";for(let w=0;w<g;w++)r.append(u[w],Ft()),pt.nextNode(),c.push({type:2,index:++n});r.append(u[g],Ft())}}}else if(r.nodeType===8)if(r.data===fi)c.push({type:2,index:n});else{let u=-1;for(;(u=r.data.indexOf(it,u+1))!==-1;)c.push({type:7,index:n}),u+=it.length-1}n++}}static createElement(i,t){let e=mt.createElement("template");return e.innerHTML=i,e}};function yt(s,i,t=s,e){if(i===ft)return i;let r=e!==void 0?t._$Co?.[e]:t._$Cl,n=Wt(i)?void 0:i._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),n===void 0?r=void 0:(r=new n(s),r._$AT(s,t,e)),e!==void 0?(t._$Co??=[])[e]=r:t._$Cl=r),r!==void 0&&(i=yt(s,r._$AS(s,i.values),r,e)),i}var Pe=class{constructor(i,t){this._$AV=[],this._$AN=void 0,this._$AD=i,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(i){let{el:{content:t},parts:e}=this._$AD,r=(i?.creationScope??mt).importNode(t,!0);pt.currentNode=r;let n=pt.nextNode(),a=0,o=0,c=e[0];for(;c!==void 0;){if(a===c.index){let h;c.type===2?h=new Bt(n,n.nextSibling,this,i):c.type===1?h=new c.ctor(n,c.name,c.strings,this,i):c.type===6&&(h=new Oe(n,this,i)),this._$AV.push(h),c=e[++o]}a!==c?.index&&(n=pt.nextNode(),a++)}return pt.currentNode=mt,r}p(i){let t=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(i,e,t),t+=e.strings.length-2):e._$AI(i[t])),t++}},Bt=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(i,t,e,r){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=i,this._$AB=t,this._$AM=e,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let i=this._$AA.parentNode,t=this._$AM;return t!==void 0&&i?.nodeType===11&&(i=t.parentNode),i}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(i,t=this){i=yt(this,i,t),Wt(i)?i===p||i==null||i===""?(this._$AH!==p&&this._$AR(),this._$AH=p):i!==this._$AH&&i!==ft&&this._(i):i._$litType$!==void 0?this.$(i):i.nodeType!==void 0?this.T(i):sr(i)?this.k(i):this._(i)}O(i){return this._$AA.parentNode.insertBefore(i,this._$AB)}T(i){this._$AH!==i&&(this._$AR(),this._$AH=this.O(i))}_(i){this._$AH!==p&&Wt(this._$AH)?this._$AA.nextSibling.data=i:this.T(mt.createTextNode(i)),this._$AH=i}$(i){let{values:t,_$litType$:e}=i,r=typeof e=="number"?this._$AC(i):(e.el===void 0&&(e.el=zt.createElement($i(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===r)this._$AH.p(t);else{let n=new Pe(r,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(i){let t=pi.get(i.strings);return t===void 0&&pi.set(i.strings,t=new zt(i)),t}k(i){Fe(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,e,r=0;for(let n of i)r===t.length?t.push(e=new s(this.O(Ft()),this.O(Ft()),this,this.options)):e=t[r],e._$AI(n),r++;r<t.length&&(this._$AR(e&&e._$AB.nextSibling,r),t.length=r)}_$AR(i=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);i!==this._$AB;){let e=oi(i).nextSibling;oi(i).remove(),i=e}}setConnected(i){this._$AM===void 0&&(this._$Cv=i,this._$AP?.(i))}},vt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(i,t,e,r,n){this.type=1,this._$AH=p,this._$AN=void 0,this.element=i,this.name=t,this._$AM=r,this.options=n,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=p}_$AI(i,t=this,e,r){let n=this.strings,a=!1;if(n===void 0)i=yt(this,i,t,0),a=!Wt(i)||i!==this._$AH&&i!==ft,a&&(this._$AH=i);else{let o=i,c,h;for(i=n[0],c=0;c<n.length-1;c++)h=yt(this,o[e+c],t,c),h===ft&&(h=this._$AH[c]),a||=!Wt(h)||h!==this._$AH[c],h===p?i=p:i!==p&&(i+=(h??"")+n[c+1]),this._$AH[c]=h}a&&!r&&this.j(i)}j(i){i===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,i??"")}},Ne=class extends vt{constructor(){super(...arguments),this.type=3}j(i){this.element[this.name]=i===p?void 0:i}},Ue=class extends vt{constructor(){super(...arguments),this.type=4}j(i){this.element.toggleAttribute(this.name,!!i&&i!==p)}},He=class extends vt{constructor(i,t,e,r,n){super(i,t,e,r,n),this.type=5}_$AI(i,t=this){if((i=yt(this,i,t,0)??p)===ft)return;let e=this._$AH,r=i===p&&e!==p||i.capture!==e.capture||i.once!==e.once||i.passive!==e.passive,n=i!==p&&(e===p||r);r&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,i),this._$AH=i}handleEvent(i){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,i):this._$AH.handleEvent(i)}},Oe=class{constructor(i,t,e){this.element=i,this.type=6,this._$AN=void 0,this._$AM=t,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(i){yt(this,i)}};var or=Ie.litHtmlPolyfillSupport;or?.(zt,Bt),(Ie.litHtmlVersions??=[]).push("3.3.3");var yi=(s,i,t)=>{let e=t?.renderBefore??i,r=e._$litPart$;if(r===void 0){let n=t?.renderBefore??null;e._$litPart$=r=new Bt(i.insertBefore(Ft(),n),n,void 0,t??{})}return r._$AI(s),r};var ze=globalThis,_=class extends X{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let i=super.createRenderRoot();return this.renderOptions.renderBefore??=i.firstChild,i}update(i){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(i),this._$Do=yi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ft}};_._$litElement$=!0,_.finalized=!0,ze.litElementHydrateSupport?.({LitElement:_});var cr=ze.litElementPolyfillSupport;cr?.({LitElement:_});(ze.litElementVersions??=[]).push("4.2.2");var Be={controls:"Controls",ventilation:"Ventilation",auto:"Auto",automatic:"Automatic",level:"Level {level}",temperature:"Temperature",now:"now",humidity:"Humidity",dry:"Dry",comfort:"Comfort",wet:"Wet",functions:"Functions",boost:"Boost",circulation:"Circulation",overpressure:"Overpressure",night:"Night",party:"Party",stopAll:"Stop all",vacancy:"Vacancy",from:"From",until:"Until",clearVacancy:"Cancel vacancy",save:"Save",duration:"Duration",off:"Off",cancel:"Cancel",start:"Start",stop:"Stop",left:"left",stopping:"Stopping…",stoppingHint:"Waiting for the unit to confirm.",overriddenTitle:"The unit restarted this function",overriddenBody:"The stop was accepted but the function is still running, so something on the unit is holding it on — typically a latched kitchen-hood or boost input, an ALFA controller setting, or a wall button. Clear it there and stop again.",airQuality:"Air quality",qualityGood:"Good",qualityModerate:"Moderate",qualityPoor:"Poor",qualityUnknown:"Unknown",recovered:"Recovered",outdoor:"Outdoor",filterClogging:"Filter clogging",filter:"Filter",supply:"Supply",exhaust:"Exhaust",rpm:"rpm",bypass:"BYPASS",ductOutside:"Outside air",ductWaste:"Waste air",ductFresh:"Fresh air",ductInside:"Inside air",metricCo2:"CO₂",metricTemperature:"Temperature",metricHumidity:"Humidity",perSensor:"{metric} per sensor",noSensors:"No peripheral sensors reporting.",variantFlow:"Air flow",variantUnit:"Unit schematic",variantService:"Service schematic",variantDiagram:"Airflow diagram",variantFlowLabel:"Air flow (app screen)",variantUnitLabel:"Unit schematic",variantServiceLabel:"Service schematic",variantDiagramLabel:"Airflow diagram (line drawing)",variantFlowHint:"The mobile app's air-quality screen: glowing ribbons, air quality and filter.",variantUnitHint:"The casing at its real proportions, one full-bore duct per flange.",variantServiceHint:"Flow direction per duct, both fan speeds, filter wear.",variantDiagramHint:"The manual's process diagram: runs, bypass, fans and the exchanger.",editorVariant:"Schematic",editorVariantEntity:"Or choose it from this helper",editorPrefix:"Entity prefix",editorTitle:"Card title",ariaFlow:"Air flow through the heat exchanger",ariaUnit:"Ventilation unit, duct temperatures and humidity",ariaService:"Ventilation unit: duct readings, fans and filter",ariaDiagram:"Ventilation unit airflow diagram with duct readings",minuteLong:"min",ariaDuration:"Duration in minutes",ariaLower:"Lower target",ariaRaise:"Raise target",ariaFunctionDuration:"{function} duration",entityMissing:"Entity {entity} not found.",setPrefixHint:'Set "prefix" or name the entities explicitly.',cardMissing:"Card {tag} is not registered.",optionUnknown:'{entity} is "{state}", which is not one of: {options}.',hourShort:"h",minuteShort:"m",secondShort:"s"};var vi={controls:"Керування",ventilation:"Вентиляція",auto:"Авто",automatic:"Автоматично",level:"Рівень {level}",temperature:"Температура",now:"зараз",humidity:"Вологість",dry:"Сухо",comfort:"Комфорт",wet:"Волого",functions:"Функції",boost:"Boost",circulation:"Циркуляція",overpressure:"Надлишковий тиск",night:"Нічний режим",party:"Вечірка",stopAll:"Зупинити все",vacancy:"Відпустка",from:"Початок",until:"Кінець",clearVacancy:"Скасувати відпустку",save:"Зберегти",duration:"Тривалість",off:"Вимк.",cancel:"Скасувати",start:"Запустити",stop:"Зупинити",left:"залишилось",stopping:"Зупиняємо…",stoppingHint:"Очікуємо підтвердження від установки.",overriddenTitle:"Установка знову увімкнула цю функцію",overriddenBody:"Зупинку прийнято, але функція досі працює — отже, щось на установці тримає її увімкненою: зазвичай це замкнений вхід кухонної витяжки або Boost, налаштування контролера ALFA чи настінна кнопка. Зніміть це там і зупиніть ще раз.",airQuality:"Якість повітря",qualityGood:"Добра",qualityModerate:"Помірна",qualityPoor:"Погана",qualityUnknown:"Невідомо",recovered:"Рекуперовано",outdoor:"Зовні",filterClogging:"Забруднення фільтра",filter:"Фільтр",supply:"Приплив",exhaust:"Витяжка",rpm:"об/хв",bypass:"БАЙПАС",ductOutside:"Зовнішнє повітря",ductWaste:"Викидне повітря",ductFresh:"Припливне повітря",ductInside:"Витяжне повітря",metricCo2:"CO₂",metricTemperature:"Температура",metricHumidity:"Вологість",perSensor:"{metric} за датчиками",noSensors:"Периферійні датчики не звітують.",variantFlow:"Потік повітря",variantUnit:"Схема блока",variantService:"Сервісна схема",variantDiagram:"Схема руху повітря",variantFlowLabel:"Потік повітря (екран застосунку)",variantUnitLabel:"Схема блока",variantServiceLabel:"Сервісна схема",variantDiagramLabel:"Схема руху повітря (креслення)",variantFlowHint:"Екран якості повітря з мобільного застосунку: сяйливі стрічки, якість повітря та фільтр.",variantUnitHint:"Корпус у справжніх пропорціях, по одному повноцінному повітроводу на фланець.",variantServiceHint:"Напрямок потоку в кожному повітроводі, оберти обох вентиляторів, знос фільтра.",variantDiagramHint:"Технологічна схема з посібника: канали, байпас, вентилятори та рекуператор.",editorVariant:"Схема",editorVariantEntity:"Або оберіть її цим помічником",editorPrefix:"Префікс сутностей",editorTitle:"Заголовок картки",ariaFlow:"Потік повітря через рекуператор",ariaUnit:"Вентиляційна установка: температура та вологість повітроводів",ariaService:"Вентиляційна установка: показники повітроводів, вентилятори та фільтр",ariaDiagram:"Схема руху повітря в установці з показниками повітроводів",minuteLong:"хв",ariaDuration:"Тривалість у хвилинах",ariaLower:"Зменшити цільову",ariaRaise:"Збільшити цільову",ariaFunctionDuration:"Тривалість: {function}",entityMissing:"Сутність {entity} не знайдено.",setPrefixHint:"Задайте «prefix» або вкажіть сутності явно.",cardMissing:"Картку {tag} не зареєстровано.",optionUnknown:"{entity} має стан «{state}», якого немає серед: {options}.",hourShort:"год",minuteShort:"хв",secondShort:"с"};var dr={en:Be,uk:vi};function ur(s){return(s?.locale?.language??s?.language??"en").toLowerCase().split("-")[0]}function f(s,i,t){let e=dr[ur(s)]?.[i]??Be[i];return t?e.replace(/\{(\w+)\}/g,(r,n)=>n in t?String(t[n]):r):e}var F="#0f1216",bi="#1b1b1e",wi="#26262a",oe="#35353a",G="#f2f2f7",ce="#8e8e93",le="#6fce6f",he="#b9b02f",de="#d9564f",ue="#6edc96",pe="#79828f",xi="#e0392c",bt="#0b2413",b={waste:"#ffc800",outside:"#67c814",fresh:"#19afff",inside:"#ff2e11"},wt=[b.inside,"#ff810a",b.waste],Kt=[b.outside,b.fresh],rt={bright:"#e6e6ea",light:"#d7d7db",mid:"#c9c9ce",dim:"#8f8f95",dark:"#6a6a6f",darker:"#5d5d61",track:"#333338"},me=["#6b4a12","#d99a2a","#ffb15c"],S={line:"#e8ecf2",casing:"#f8f8f8",seam:"#dcdce0",collar:"#9b9ba1",panel:"#ededf0",panelEdge:"#c9c9ce",ink:"#4a4a50",dim:"#7e7e85",fainter:"#8e8e95",wordmark:"#8b8b90",wordmarkDim:"#adadb2",led:"#61d960"},k={canvas:"18px",pill:"13px",button:"12px",chip:"999px"},pr=923,mr=500,_i=pr/mr,xt=Math.round(2*_i*10)/10,H=Math.round(1.4*_i*10)/10,gt=Math.round(H*.9*10)/10,fe=Math.round(H*.72*10)/10,ki="12px",Si="500",Ai="13px";var d=s=>ne(s);function P(s,i){if(!s||!i)return;let t=s.states[i];if(!t||t.state==="unavailable"||t.state==="unknown")return;let e=Number(t.state);return Number.isFinite(e)?e:void 0}function _t(s,i){if(!s||!i)return;let t=s.states[i];if(t&&!(t.state==="unavailable"||t.state==="unknown"))return t.state}function Gt(s,i){return _t(s,i)==="on"}function Ci(s,i=1){return s===void 0?"--":s.toFixed(i)}function Ke(s,i){if(!i||i<=0)return"";let t=Math.floor(i/3600),e=Math.floor(i%3600/60),r=f(s,"hourShort"),n=f(s,"minuteShort");return t>0?`${t}${r} ${e}${n}`:e>0?`${e}${n}`:`${i}${f(s,"secondShort")}`}var D="sensor.jablotron_futura",j={co2:{label:"metricCo2",unit:"ppm",icon:"mdi:leaf",digits:0,min:400,max:1200},temperature:{label:"metricTemperature",unit:"°C",icon:"mdi:thermometer",digits:1,min:18,max:28},humidity:{label:"metricHumidity",unit:"%",icon:"mdi:water-percent",digits:0,min:30,max:70}},fr=/^_(alfa|co2_sensor|wall_controller|external_sensor)_\d+_/;function ge(s,i,t){if(!s)return[];let e=`_${t}`;return Object.keys(s.states).filter(r=>!r.startsWith(i)||!r.endsWith(e)||!fr.test(r.slice(i.length))?!1:!r.includes("_ntc_")&&!r.includes("_floor_")).sort()}function Ge(s,i){return s?.entities?.[i]?.device_id??void 0}var gr=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");function $e(s,i,t){let e=s?.states[i]?.attributes?.friendly_name;if(!e)return i;let r=Ge(s,i),n=r?s?.devices?.[r]:void 0,a=n?.name_by_user||n?.name,o=a&&e.toLowerCase().startsWith(a.toLowerCase())?e.slice(a.length):e.replace(/^Jablotron Futura\s*/i,"");return[t,"CO2","CO₂",f(s,j[t].label)].reduce((m,u)=>m.replace(new RegExp(`\\s*${gr(u)}$`,"i"),""),o).replace(/[\s\u2014\u2013-]+$/,"").trim()}function O(s){return l`<div class="futura-error">${s}</div>`}var N=A`
  :host {
    /* Theme tokens where the card should follow the user's HA theme, fixed
       tokens where it must match artwork. Every fallback and every fixed value
       comes from tokens.ts. */
    --futura-bg: var(--ha-card-background, var(--card-background-color, ${d(F)}));
    --futura-panel: var(--secondary-background-color, rgba(255, 255, 255, 0.06));
    --futura-text: var(--primary-text-color, ${d(G)});
    --futura-muted: var(--secondary-text-color, ${d(ce)});
    /* Active controls take the "running" green, not the "reading is good" one. */
    --futura-accent: var(--state-icon-active-color, ${d(ue)});
    --futura-good: ${d(le)};
    --futura-moderate: ${d(he)};
    --futura-poor: ${d(de)};
    --futura-fault: ${d(xi)};
    --futura-neutral: ${d(pe)};
    /* One canvas radius, not HA's 16px default fighting the cards' own 18. */
    --futura-radius: ${d(k.canvas)};
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
    border-radius: ${d(k.pill)};
    background: rgba(12, 14, 18, 0.78);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 4px 8px;
    font-size: ${d(ki)};
    font-weight: ${d(Si)};
    color: rgba(255, 255, 255, 0.92);
    font-variant-numeric: tabular-nums;
  }

  .readout-pill ha-icon {
    --mdc-icon-size: ${d(Ai)};
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
`;var $r=[["temp_ambient","outside_air_temperature"],["temp_fresh","supply_air_temperature"],["temp_indoor","extract_air_temperature"],["temp_waste","exhaust_air_temperature"],["humidity_ambient","outside_air_humidity"],["humidity_fresh","supply_air_humidity"],["humidity_indoor","extract_air_humidity"],["humidity_waste","exhaust_air_humidity"],["air_flow","air_flow"],["heat_recovered","heat_recovered"],["filter_wear","filter_clogging"],["air_quality","air_quality"],["temp_outdoor","outdoor_temperature"]],yr=923,Ei=660,Vt=146,qt=90,Xt=252,st=qt+Vt/2,at=Xt+Vt/2,W=192,ot=470,je=16,Ti=13,vr=28,br=36,Ve=Ti*2,qe=52,jt=630,Ri=b.waste,Li=b.outside,wr=b.fresh,xr=b.inside,_r=[{label:"waste",tempKey:"temp_waste",humidityKey:"humidity_waste",x:qt,direction:"up",color:Ri,strong:!1,row:"top"},{label:"outside",tempKey:"temp_ambient",humidityKey:"humidity_ambient",x:Xt,direction:"down",color:Li,strong:!0,row:"top"},{label:"supply",tempKey:"temp_fresh",humidityKey:"humidity_fresh",x:qt,direction:"down",color:wr,strong:!0,row:"bottom"},{label:"inside",tempKey:"temp_indoor",humidityKey:"humidity_indoor",x:Xt,direction:"up",color:xr,strong:!1,row:"bottom"}],ct=class ct extends _{constructor(){super(...arguments);this.config={type:"custom:futura-flow-card"};this.labelWidths={}}connectedCallback(){super.connectedCallback(),document.fonts?.ready.then(()=>{this.labelWidths={},this.requestUpdate()})}updated(){let t=this.renderRoot.querySelectorAll("text[data-measure]"),e=!1;t.forEach(r=>{let n=r.dataset.measure;if(!n)return;let a=r.getComputedTextLength();a&&Math.abs((this.labelWidths[n]??0)-a)>.5&&(this.labelWidths[n]=a,e=!0)}),e&&this.requestUpdate()}pairLayout(t,e,r=12){let n=this.labelWidths[t]??0,a=e+r+n,o=jt-a/2;return{iconX:o,textCx:o+e+r+n/2}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={show_filter:!0,show_outdoor:!0,...t},this.toggleAttribute("theme-aware",!!this.config.theme_aware)}getCardSize(){return 7}static getStubConfig(){return{type:"custom:futura-flow-card",prefix:D}}entity(t){let e=this.config[t];if(typeof e=="string")return e;let r=$r.find(([n])=>n===t)?.[1];return r?`${this.config.prefix??D}_${r}`:void 0}value(t){return P(this.hass,this.entity(t))}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}static arrow(t,e,r,n){let a=Ti,o=vr,c=br;return n?`M ${t-a} ${r} L ${t-a} ${e+c} L ${t-o} ${e+c} L ${t} ${e} L ${t+o} ${e+c} L ${t+a} ${e+c} L ${t+a} ${r} Z`:`M ${t-a} ${e} L ${t-a} ${r-c} L ${t-o} ${r-c} L ${t} ${r} L ${t+o} ${r-c} L ${t+a} ${r-c} L ${t+a} ${e} Z`}cycle(){let t=this.value("air_flow")??0;return t<=0?0:Math.max(.8,Math.min(3.5,300/t))}ductGroup(t){let e=this.value(t.tempKey),r=this.value(t.humidityKey),n=t.x+Vt/2,a=t.row==="top",o=a?46:596,c=a?88:638,h=a?112:492,m=a?168:548,u=a?0:484,g=a?W-2:Ei-484;return $`
      <g>
        <rect x=${t.x} y=${u} width=${Vt} height=${g}
              fill="var(--app-panel)" />
        <text x=${n} y=${o} text-anchor="middle"
              font-size="40" font-weight=${t.strong?600:400}
              fill=${t.strong?"var(--app-text)":rt.mid}>
          ${ct.decimal(e)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
        <text x=${n} y=${c} text-anchor="middle"
              font-size="27" fill="var(--app-dim)">
          ${r===void 0?"--":Math.round(r)} %
        </text>
        <path d=${ct.arrow(n,h,m,t.direction==="up")}
              fill=${t.color} />
      </g>
    `}collar(t,e){return $`<rect x=${t+4} y=${e} width=${Vt-8} height=${je}
                     rx="5" fill="url(#metal)" />`}ribbons(){let t=this.cycle(),e=t?`animation-duration:${t}s`:"animation-play-state:paused",r=`M ${at} ${W-6} L ${at} 252 C ${at} 306, ${st} 336, ${st} 392 L ${st} ${ot+6}`,n=`M ${at} ${ot+6} L ${at} 392 C ${at} 336, ${st} 306, ${st} 252 L ${st} ${W-6}`,a=(o,c,h)=>$`
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
    `;return $`
      ${a(n,"extractGrad",Ri)}
      ${a(r,"supplyGrad",Li)}
    `}info(){let t=_t(this.hass,this.entity("air_quality")),e=this.value("heat_recovered"),r=t==="good"?le:t==="poor"?de:t==="moderate"?he:pe,n=f(this.hass,t==="good"?"qualityGood":t==="moderate"?"qualityModerate":t==="poor"?"qualityPoor":"qualityUnknown"),a=e===void 0?"--":(e/1e3).toFixed(1).replace(".",","),o=this.pairLayout("quality",22);return $`
      <g text-anchor="middle">
        <circle cx=${o.iconX+11} cy="264" r="11" fill=${r} />
        <text data-measure="quality" x=${o.textCx} y="274"
              font-size="35" font-weight="600"
              fill="var(--app-text)">${n}</text>
        <text x=${jt} y="310" font-size="27"
              fill="var(--app-dim)">${f(this.hass,"airQuality")}</text>
        <text x=${jt} y="374" font-size="35" font-weight="600"
              fill="var(--app-text)">${a} kW</text>
        <text x=${jt} y="410" font-size="27"
              fill="var(--app-dim)">${f(this.hass,"recovered")}</text>
      </g>
    `}outdoor(){if(this.config.show_outdoor===!1)return p;let t=this.value("temp_outdoor");if(t==null)return p;let e=this.pairLayout("outdoor",22);return $`
      <g>
        <path d=${ct.thermometer(e.iconX,qe-10)}
              fill="none" stroke="var(--app-dim)" stroke-width=${H}
              stroke-linecap="round" />
        <text data-measure="outdoor" x=${e.textCx} y=${qe}
              text-anchor="middle" font-size="27"
              fill="var(--app-dim)">${f(this.hass,"outdoor")}</text>
        <text x=${jt} y=${qe+52} text-anchor="middle"
              font-size="40" font-weight="600" fill="var(--app-text)">
          ${ct.decimal(t)}<tspan
            font-size="22" font-weight="400" fill="var(--app-dim)"> °C</tspan>
        </text>
      </g>
    `}static thermometer(t,e){return`M ${t+5} ${e-10} a 6 6 0 0 1 12 0 v 16 a 9 9 0 1 1 -12 0 Z`}glyphs(){return $`
      <g stroke="var(--app-dim)" fill="none" stroke-width=${H}
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
          <span class="name">${f(this.hass,"filterClogging")}</span>
          <span class="pct">${Math.round(t)} %</span>
        </div>
        <div class="bar"><span style=${`width:${e}%`}></span></div>
      </div>
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=this.entity("temp_ambient");return t&&!this.hass.states[t]?l`<ha-card>
        ${O(`${f(this.hass,"entityMissing",{entity:t})} `+f(this.hass,"setPrefixHint"))}
      </ha-card>`:l`
      <ha-card>
        <div class="schematic">
          <svg viewBox="0 0 ${yr} ${Ei}" role="img"
               aria-label=${f(this.hass,"ariaFlow")}>
            <defs>
              <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color=${rt.darker} />
                <stop offset="22%" stop-color=${rt.light} />
                <stop offset="48%" stop-color=${rt.dim} />
                <stop offset="74%" stop-color=${rt.bright} />
                <stop offset="100%" stop-color=${rt.dark} />
              </linearGradient>
              <linearGradient id="supplyGrad" gradientUnits="userSpaceOnUse"
                x1=${at} y1=${W} x2=${st} y2=${ot}>
                <stop offset="0%" stop-color=${Kt[0]} />
                <stop offset="100%" stop-color=${Kt[1]} />
              </linearGradient>
              <linearGradient id="extractGrad" gradientUnits="userSpaceOnUse"
                x1=${at} y1=${ot} x2=${st} y2=${W}>
                <stop offset="0%" stop-color=${wt[0]} />
                <stop offset="50%" stop-color=${wt[1]} />
                <stop offset="100%" stop-color=${wt[2]} />
              </linearGradient>
              <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
              <clipPath id="bodyClip">
                <rect x="62" y=${W} width="800" height=${ot-W}
                      rx="16" />
              </clipPath>
            </defs>

            ${_r.map(e=>this.ductGroup(e))}
            ${this.outdoor()}

            ${this.collar(qt,W-je)}
            ${this.collar(Xt,W-je)}
            ${this.collar(qt,ot)}
            ${this.collar(Xt,ot)}

            <rect x="62" y=${W} width="800" height=${ot-W}
                  rx="16" fill="var(--app-body)" stroke="var(--app-border)"
                  stroke-width=${fe} />
            <g clip-path="url(#bodyClip)">${this.ribbons()}</g>
            ${this.glyphs()}
            ${this.info()}
          </svg>
        </div>
        ${this.filterBar()}
      </ha-card>
    `}};ct.properties={hass:{attribute:!1},config:{state:!0}},ct.styles=[N,A`
      :host {
        --app-bg: ${d(F)};
        --app-panel: ${d(bi)};
        --app-body: ${d(wi)};
        --app-border: ${d(oe)};
        --app-text: ${d(G)};
        --app-dim: ${d(ce)};
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
        border-radius: ${d(k.canvas)};
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
        border-radius: ${d(k.canvas)};
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
        background: ${d(rt.track)};
        overflow: hidden;
      }

      .bar > span {
        display: block;
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          ${d(me[0])} 0%,
          ${d(me[1])} 60%,
          ${d(me[2])} 100%
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
    `];var ye=ct;var kr=["off","1","2","3","4","5","auto"],Sr=[{option:"dry",label:"dry"},{option:"comfort",label:"comfort"},{option:"wet",label:"wet"}],ve="jablotron_futura_modbus";function Ar(s){return{active:`binary_sensor.${s}_away_active`,begins:`sensor.${s}_away_begins`,ends:`sensor.${s}_away_ends`}}function Mi(s){let i=t=>String(t).padStart(2,"0");return`${s.getFullYear()}-${i(s.getMonth()+1)}-${i(s.getDate())}T${i(s.getHours())}:${i(s.getMinutes())}`}function Xe(s,i){let t=s?.states[i]?.state;if(!t||t==="unknown"||t==="unavailable")return;let e=new Date(t);return Number.isNaN(e.getTime())?void 0:e}var Cr=[{key:"boost",label:"boost",icon:"mdi:fan-plus",remaining:"boost_remaining",active:"boost_active"},{key:"circulation",label:"circulation",icon:"mdi:autorenew",remaining:"circulation_remaining",active:"circulation_active"},{key:"overpressure",label:"overpressure",icon:"mdi:weather-windy",remaining:"overpressure_remaining",active:"overpressure_active"},{key:"night",label:"night",icon:"mdi:weather-night",remaining:"night_mode_remaining",active:"night_active"},{key:"party",label:"party",icon:"mdi:glass-cocktail",remaining:"party_mode_remaining",active:"party_active"}];function Er(s){return Cr.map(i=>({...i,remaining:`sensor.${s}_${i.remaining}`,active:`binary_sensor.${s}_${i.active}`,limit:`number.${s}_${i.remaining}`}))}var Ye=5;function Tr(s){let i=[15,30,60,120,240,480,600];return(s<=120?[5,...i]:i).filter(t=>t<=s)}var Rr=35e3,Lr=6e3;function Ze(s,i){if(i<=0)return s("off");let t=Math.floor(i/60),e=i%60,r=s("hourShort"),n=s("minuteLong");return t&&e?`${t} ${r} ${e} ${n}`:t?`${t} ${r}`:`${e} ${n}`}var kt=class extends _{constructor(){super(...arguments);this.config={type:"custom:futura-control-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={show_functions:!0,show_humidity:!0,...t}}getCardSize(){return 5}static getStubConfig(){return{type:"custom:futura-control-card"}}get base(){return(this.config.prefix??D).replace(/^[a-z_]+\./,"")}get chips(){return Er(this.base)}get away(){return Ar(this.base)}get target(){let t=Ge(this.hass,this.selectEntity);return t?{device_id:t}:{}}get selectEntity(){return this.config.ventilation_select??`select.${this.base}_ventilation`}t(t,e){return this.config.labels?.[t]??f(this.hass,t,e)}get lookup(){return(t,e)=>this.t(t,e)}get humidityEntity(){return this.config.humidity_select??`select.${this.base}_humidity_mode`}get climateEntity(){return this.config.climate??`climate.${this.base}`}async setLevel(t){await this.hass?.callService("select","select_option",{entity_id:this.selectEntity,option:t})}async nudge(t){let e=this.hass?.states[this.climateEntity],r=Number(e?.attributes?.temperature);if(!Number.isFinite(r))return;let n=Number(e?.attributes?.min_temp),a=Number(e?.attributes?.max_temp),o=Number(e?.attributes?.target_temp_step)||.5,c=r+t;c=Math.round(c/o)*o,Number.isFinite(n)&&(c=Math.max(n,c)),Number.isFinite(a)&&(c=Math.min(a,c)),c!==r&&await this.hass?.callService("climate","set_temperature",{entity_id:this.climateEntity,temperature:c})}atLimit(t){let e=this.hass?.states[this.climateEntity],r=Number(e?.attributes?.temperature);if(!Number.isFinite(r))return!0;let n=Number(e?.attributes?.[t<0?"min_temp":"max_temp"]);return Number.isFinite(n)?t<0?r<=n:r>=n:!1}async setHumidity(t){await this.hass?.callService("select","select_option",{entity_id:this.humidityEntity,option:t})}humidity(){if(this.config.show_humidity===!1)return p;if(!this.hass?.states[this.humidityEntity])return p;let t=_t(this.hass,this.humidityEntity);return l`
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
          ${Sr.map(e=>l`
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
    `}maxMinutes(t){let e=Number(this.hass?.states[t.limit]?.attributes?.max);return Number.isFinite(e)&&e>0?Math.round(e/60):120}openPicker(t){let e=P(this.hass,t.remaining)??0,r=e>0?Math.ceil(e/60/Ye)*Ye:Math.min(60,this.maxMinutes(t));this.picker={fn:t,minutes:Math.min(r,this.maxMinutes(t))}}openAwayPicker(){let t=Xe(this.hass,this.away.begins),e=Xe(this.hass,this.away.ends),r=new Date,n=new Date(r.getTime()+168*3600*1e3);this.awayPicker={begin:Mi(t??r),end:Mi(e??n)}}closeAwayPicker(){this.awayPicker=void 0}async setAway(t,e){await this.hass?.callService(ve,"set_away",{...this.target,begin:t,end:e}),this.closeAwayPicker()}async clearAway(){await this.hass?.callService(ve,"clear_away",{...this.target}),this.closeAwayPicker()}closePicker(){window.clearTimeout(this.stopTimeout),this.picker=void 0,this.stopState=void 0}async runFunction(t,e){await this.hass?.callService(ve,"set_function",{...this.target,function:t.key,duration:Math.round(e)*60}),this.closePicker()}async stopFunction(t){this.stopState={fn:t,phase:"waiting",since:Date.now()},await this.hass?.callService(ve,"set_function",{...this.target,function:t.key,duration:0}),window.clearTimeout(this.stopTimeout),this.stopTimeout=window.setTimeout(()=>this.judgeStop(),Rr)}hasStopped(t){return(P(this.hass,t.remaining)??0)<=0&&!Gt(this.hass,t.active)}judgeStop(){let t=this.stopState;t&&(this.stopState=this.hasStopped(t.fn)?void 0:{fn:t.fn,phase:"overridden",since:t.since},this.stopState||this.closePicker())}willUpdate(t){t.has("hass")&&this.stopState?.phase==="waiting"&&Date.now()-this.stopState.since>=Lr&&this.hasStopped(this.stopState.fn)&&(window.clearTimeout(this.stopTimeout),this.stopState=void 0,this.picker=void 0)}disconnectedCallback(){window.clearTimeout(this.stopTimeout),super.disconnectedCallback()}async stopAll(){await this.hass?.callService("button","press",{entity_id:`button.${this.base}_stop_all_functions`})}stopNotice(){return this.stopState?.phase==="waiting"?l`
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
    `}awayDialog(){let t=this.awayPicker;if(!t)return p;let e=Gt(this.hass,this.away.active),r=!t.begin||!t.end||t.end<=t.begin;return l`
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
    `}pickerDialog(){let t=this.picker;if(!t)return p;let{fn:e,minutes:r}=t,n=this.maxMinutes(e),a=P(this.hass,e.remaining)??0;return l`
      <div
        class="scrim"
        @click=${o=>{o.target===o.currentTarget&&this.closePicker()}}
      >
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-label=${this.t("ariaFunctionDuration",{function:this.t(e.label)})}
          @keydown=${o=>{o.key==="Escape"&&this.closePicker()}}
        >
          <div class="dialog-head">
            <ha-icon icon=${e.icon}></ha-icon>
            <span>${this.t(e.label)}</span>
            ${a>0?l`<span class="running">
                  ${Ke(this.hass,a)} ${this.t("left")}
                </span>`:p}
          </div>

          ${this.stopState?.fn.key===e.key?this.stopNotice():l`<div class="readout">${Ze(this.lookup,r)}</div>`}

          ${this.stopState?.fn.key===e.key?p:l`
          <input
            class="slider"
            type="range"
            min="0"
            max=${n}
            step=${Ye}
            .value=${String(r)}
            aria-label=${this.t("ariaDuration")}
            @input=${o=>{let c=Number(o.target.value);this.picker={fn:e,minutes:c}}}
          />
          <div class="scale">
            <span>${this.t("off")}</span><span>${Ze(this.lookup,n)}</span>
          </div>`}

          <div class="quick" ?hidden=${this.stopState?.fn.key===e.key}>
            ${Tr(n).map(o=>l`
                  <button
                    class=${o===r?"chip on":"chip"}
                    @click=${()=>{this.picker={fn:e,minutes:o}}}
                  >
                    ${Ze(this.lookup,o)}
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
    `}ventilation(){let t=_t(this.hass,this.selectEntity);return l`
      <section>
        <div class="head">
          <span class="name"><ha-icon icon="mdi:fan"></ha-icon>${this.t("ventilation")}</span>
          <span class="current">
            ${t==="auto"?this.t("auto"):t??"--"}
          </span>
        </div>
        <div class="levels">
          ${kr.map(e=>l`
              <button
                class="level"
                aria-pressed=${t===e?"true":"false"}
                title=${e==="off"?this.t("off"):e==="auto"?this.t("automatic"):this.t("level",{level:e})}
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
            ${Number.isFinite(r)?`${r.toFixed(1)} °C ${this.t("now")}`:"--"}
          </span>
        </div>
        <div class="stepper">
          <button
            ?disabled=${this.atLimit(-.5)}
            @click=${()=>this.nudge(-.5)}
            aria-label=${this.t("ariaLower")}
          >
            &minus;
          </button>
          <span class="target">
            ${Number.isFinite(e)?e.toFixed(1):"--"} °C
          </span>
          <button
            ?disabled=${this.atLimit(.5)}
            @click=${()=>this.nudge(.5)}
            aria-label=${this.t("ariaRaise")}
          >
            &plus;
          </button>
        </div>
      </section>
    `}awayChip(){if(this.hass?.states[this.away.ends]===void 0)return p;let t=Gt(this.hass,this.away.active),e=Xe(this.hass,this.away.ends),r=t&&e?e.toLocaleDateString(void 0,{day:"numeric",month:"short"}):"";return l`
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
          ${t.map(e=>{let r=Gt(this.hass,e.active),n=Ke(this.hass,P(this.hass,e.remaining));return l`
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
          ${t.some(e=>(P(this.hass,e.remaining)??0)>0)?l`
                <button class="chip" @click=${()=>this.stopAll()}>
                  <ha-icon icon="mdi:stop-circle-outline"></ha-icon>${this.t("stopAll")}
                </button>
              `:p}
        </div>
      </section>
    `}render(){return this.hass?this.hass.states[this.selectEntity]?l`
      <ha-card>
        <!-- No title in the config means the card's own heading, in the
             frontend's language; an empty one means no heading at all. -->
        ${this.config.title??this.t("controls")?l`<div class="title">${this.config.title??this.t("controls")}</div>`:p}
        ${this.ventilation()} ${this.temperature()} ${this.humidity()}
        ${this.functions()} ${this.pickerDialog()} ${this.awayDialog()}
      </ha-card>
    `:l`<ha-card>
        ${O(this.t("entityMissing",{entity:this.selectEntity}))}
      </ha-card>`:l`<ha-card></ha-card>`}};kt.properties={hass:{attribute:!1},config:{state:!0},picker:{state:!0},awayPicker:{state:!0},stopState:{state:!0}},kt.styles=[N,A`
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
        border-radius: ${d(k.button)};
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
        color: ${d(bt)};
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
        border-radius: ${d(k.button)};
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
        border-radius: ${d(k.chip)};
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
        border-radius: ${d(k.canvas)};
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
        border-radius: ${d(k.button)};
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
        border-radius: ${d(k.chip)};
        background: var(--futura-panel);
        color: var(--futura-text);
        font: inherit;
        font-size: 0.78rem;
      }

      .quick .chip.on {
        background: var(--futura-accent);
        color: ${d(bt)};
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
        border: 1px solid ${d(oe)};
        border-radius: ${d(k.button)};
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
        border-radius: ${d(k.button)};
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
        color: ${d(bt)};
      }

      .actions .primary[disabled] {
        opacity: 0.4;
        cursor: default;
      }
    `];var St=class extends _{constructor(){super(...arguments);this.config={type:"custom:futura-sensor-grid-card",metric:"co2"}}setConfig(t){if(!t)throw new Error("Missing configuration");if(t.metric&&!(t.metric in j))throw new Error(`metric must be one of ${Object.keys(j).join(", ")}`);this.config={metric:"co2",columns:3,...t}}getCardSize(){return 3}static getStubConfig(){return{type:"custom:futura-sensor-grid-card",metric:"co2"}}tiles(){let t=this.config.metric??"co2";return ge(this.hass,this.config.prefix??D,t).map(e=>{let r=Number(this.hass.states[e].state);return{entityId:e,name:$e(this.hass,e,t),value:Number.isFinite(r)?r:void 0}})}open(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=j[this.config.metric??"co2"],e=this.tiles(),r=Math.max(1,Math.min(6,this.config.columns??3));return l`
      <ha-card>
        <div class="head">
          <ha-icon icon=${t.icon}></ha-icon>
          ${this.config.title??f(this.hass,t.label)}
        </div>
        ${e.length===0?l`<div class="empty">${f(this.hass,"noSensors")}</div>`:l`
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
                        ${Ci(n.value,t.digits)}
                        <span class="unit">${t.unit}</span>
                      </span>
                    </div>
                  `)}
              </div>
            `}
      </ha-card>
    `}};St.properties={hass:{attribute:!1},config:{state:!0}},St.styles=[N,A`
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
        border-radius: ${d(k.pill)};
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
    `];var At=class extends _{constructor(){super(...arguments);this.config={type:"custom:futura-history-card"};this.signature=""}setConfig(t){if(!t)throw new Error("Missing configuration");let e=t.metric??"co2";if(!(e in j))throw new Error(`metric must be one of ${Object.keys(j).join(", ")}`);this.config={metric:e,hours_to_show:48,...t},this.signature="",this.inner=void 0}getCardSize(){return 4}static getStubConfig(){return{type:"custom:futura-history-card",metric:"co2"}}get metric(){return this.config.metric??"co2"}get chartTitle(){return this.config.title??f(this.hass,"perSensor",{metric:f(this.hass,j[this.metric].label)})}async sync(t){let e=t.join(",");if(e===this.signature&&this.inner){this.inner.hass=this.hass;return}let r=await window.loadCardHelpers?.();if(!r)return;this.signature=e;let n=this.config.hours_to_show??48,a=j[this.metric],o=t.map(m=>({entity:m,name:$e(this.hass,m,this.metric)})),c={min_y_axis:a.min,max_y_axis:a.max,fit_y_data:!0},h=r.createCardElement(this.config.raw?{type:"history-graph",title:this.chartTitle,hours_to_show:n,entities:o,...c}:{type:"statistics-graph",title:this.chartTitle,days_to_show:Math.max(1,Math.ceil(n/24)),period:this.config.period??"5minute",stat_types:["mean"],chart_type:"line",entities:o,...c});h.hass=this.hass,this.inner=h,this.requestUpdate()}render(){let t=ge(this.hass,this.config.prefix??D,this.metric);return t.length?(this.sync(t),l`${this.inner??p}`):p}};At.properties={hass:{attribute:!1},config:{state:!0}},At.styles=[N,A`
      ha-card {
        background: none;
        border: none;
        box-shadow: none;
        padding: 0;
      }
    `];var Yt={bodyW:995,bodyH:835,pitch:243,firstCentre:133};function Ct(s,i=560,t=170){let e=i/Yt.bodyW,r=Math.round(i*.011),n={x:t,y:s,w:i,h:Math.round(Yt.bodyH*e),r:22};return{body:n,collarX:[0,1,2,3].map(a=>Math.round(t+(Yt.firstCentre+a*Yt.pitch)*e)),collarW:Math.round(Yt.pitch*e)-r,collarH:30,lidH:Math.round(n.h*.26)}}function Di(s){return $`
    ${s.collarX.map(i=>$`
      <rect x=${i-s.collarW/2} y=${s.body.y-s.collarH}
            width=${s.collarW} height=${s.collarH*2} rx="8"
            fill=${S.collar} />
    `)}
  `}function Pi(s,i){let{x:t,y:e,w:r,h:n,r:a}=s.body;return $`
    <rect x=${t} y=${e} width=${r} height=${n} rx=${a} fill=${S.casing} />
    ${Zt(s.body,e+s.lidH,i)}
  `}function Zt(s,i,t){let{x:e,y:r,w:n,h:a,r:o}=s,c=7,h=Math.min(12,Math.round(a*.035)),m=o-c,u=r+o-Math.sqrt(Math.max(0,o*o-m*m));return $`
    <path d=${`M ${e+c} ${u} L ${e+c} ${i-h} Q ${e+c} ${i} ${e+c+h} ${i} L ${e+n-c-h} ${i} Q ${e+n-c} ${i} ${e+n-c} ${i-h} L ${e+n-c} ${u}`}
          fill="none" stroke=${S.seam} stroke-width=${t} />
  `}function Qt(s,i,t=0){let e=Math.max(t,.5),r=Math.max(e,s-e),n=Math.max(1,Math.round(r/i));return(r/n).toFixed(3)}function Ni(s,i,t,e,r,n,a,o){let c=(g,w,M,L,I)=>{let x=1-g;return x*x*x*w+3*x*x*g*M+3*x*g*g*L+g*g*g*I},h=0,m=s,u=i;for(let g=1;g<=64;g+=1){let w=g/64,M=c(w,s,t,r,a),L=c(w,i,e,n,o);h+=Math.hypot(M-m,L-u),m=M,u=L}return h}var Ui=900,Mr=1140,be={y:110,h:Mr-110},Et=Ct(650,560,170),v=Et.body,z=Et.collarX,_e=Math.round(v.w*.0361),Hi=Math.round(_e*1.95),lt={x:v.x+Math.round(v.w*.501),top:v.y+Math.round(v.h*.481),bottom:v.y+Math.round(v.h*.967),w:Math.max(4,Math.round(v.w*.016)),colour:S.led},we={jablotronY:v.y+Math.round(v.h*.42),jablotronSize:Math.round(v.h*.0267/.72),futuraY:v.y+Math.round(v.h*.9),futuraSize:Math.round(v.h*.024/.72)},Dr=20,xe=[{flange:"A",label:"ductOutside",temp:"outside_air_temperature",humidity:"outside_air_humidity",colour:b.outside,collar:0,row:0},{flange:"B",label:"ductWaste",temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity",colour:b.waste,collar:1,row:1},{flange:"C",label:"ductFresh",temp:"supply_air_temperature",humidity:"supply_air_humidity",colour:b.fresh,collar:2,row:0},{flange:"D",label:"ductInside",temp:"extract_air_temperature",humidity:"extract_air_humidity",colour:b.inside,collar:3,row:1}],Oi=[150,330],ht=class ht extends _{constructor(){super(...arguments);this.config={type:"custom:futura-unit-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 8}static getStubConfig(){return{type:"custom:futura-unit-card"}}get entityPrefix(){return this.config.prefix??D}reading(t){return P(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}ductPill(t){let e=z[t.collar];return l`
      <div
        class="pill"
        style=${`left:${e/Ui*100}%;top:${(Oi[t.row]-be.y)/be.h*100}%`}
      >
        <span class="name">${f(this.hass,t.label)}</span>
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${t.colour}`}></ha-icon>
          ${ht.decimal(this.reading(t.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${ht.decimal(this.reading(t.humidity),0)} %
        </span>
      </div>
    `}static duct(t){let e=z[t.collar],r=Oi[t.row]+Dr,n=v.y+10;return $`
      <path d=${`M ${e} ${r} L ${e} ${n}`}
            fill="none" stroke=${t.colour} stroke-width=${_e}
            stroke-linecap="round"
            stroke-dasharray=${`0 ${Qt(n-r,Hi)}`} />
    `}static interior(){let t=v.y+_e/2,e=(n,a)=>{let o=Math.abs(z[a]-z[n])/2,c=z[a]>z[n]?0:1;return`M ${z[n]} ${t} A ${o} ${o} 0 0 ${c} ${z[a]} ${t}`},r=(n,a)=>Qt(Math.PI*Math.abs(z[a]-z[n])/2,Hi);return $`
      <g stroke-width=${_e} fill="none" opacity="0.34" stroke-linecap="round">
        <path d=${e(0,2)} stroke=${xe[0].colour}
              stroke-dasharray=${`0 ${r(0,2)}`} />
        <path d=${e(3,1)} stroke=${xe[3].colour}
              stroke-dasharray=${`0 ${r(3,1)}`} />
      </g>
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <svg viewBox="0 ${be.y} ${Ui} ${be.h}" role="img"
               aria-label=${f(this.hass,"ariaUnit")}>
            <!-- collars first, then the runs over them: the dots land on the
                 collar as they do on the app's screen. The casing comes after
                 both and hides whatever crosses its edge. -->
            ${z.map(e=>$`
              <rect x=${e-Et.collarW/2} y=${v.y-Et.collarH}
                    width=${Et.collarW} height=${Et.collarH*2} rx="8"
                    fill=${S.collar} />
            `)}
            ${xe.map(e=>ht.duct(e))}

            <rect x=${v.x} y=${v.y} width=${v.w} height=${v.h}
                  rx=${v.r} fill=${S.casing} />
            <!-- the filter hatch, a fifth of the way down the casing -->
            ${Zt(v,v.y+v.h*.2,H)}
            ${ht.interior()}
            <text x=${v.x+v.w/2} y=${we.jablotronY}
                  text-anchor="middle" font-size=${we.jablotronSize}
                  font-weight="700" letter-spacing="1.6"
                  fill=${S.wordmark}>JABLOTRON</text>
            <text x=${v.x+v.w-28} y=${we.futuraY}
                  text-anchor="end" font-size=${we.futuraSize}
                  letter-spacing="1.4" fill=${S.wordmarkDim}>FUTURA</text>
            <!-- the status LED down the centre of the lower panel -->
            <rect x=${lt.x-lt.w/2} y=${lt.top} width=${lt.w}
                  height=${lt.bottom-lt.top} rx=${lt.w/2}
                  fill=${lt.colour} />
          </svg>
          ${xe.map(e=>this.ductPill(e))}
        </div>
      </ha-card>
    `:l`<ha-card>
        ${O(f(this.hass,"entityMissing",{entity:t}))}
      </ha-card>`}};ht.properties={hass:{attribute:!1},config:{state:!0}},ht.styles=[N,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${d(F)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${d(k.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${d(G)};
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
    `];var ke=ht;var Ii=900,Pr=14,Fi={top:84,bottom:162},C=Ct(196),Wi=C.body.y+C.body.h+18,Jt=Math.round(C.body.w*.027),Nr=Math.round(Jt*2.2),zi=[{flange:"A",temp:"outside_air_temperature",humidity:"outside_air_humidity",colour:b.outside,collar:0,into:!0},{flange:"B",temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity",colour:b.waste,collar:1,into:!1},{flange:"C",temp:"supply_air_temperature",humidity:"supply_air_humidity",colour:b.fresh,collar:2,into:!1},{flange:"D",temp:"extract_air_temperature",humidity:"extract_air_humidity",colour:b.inside,collar:3,into:!0}];function Bi(s,i){let t=e=>({x:s.x+(i.x-s.x)*e,y:s.y+(i.y-s.y)*e});return{c1:t(1/3),c2:t(2/3),end:i}}function Ur(s){return`M ${s.start.x} ${s.start.y}`+s.segments.map(i=>` C ${i.c1.x} ${i.c1.y}, ${i.c2.x} ${i.c2.y}, ${i.end.x} ${i.end.y}`).join("")}function Hr(s){let i=s.start,t=0;for(let e of s.segments)t+=Ni(i.x,i.y,e.c1.x,e.c1.y,e.c2.x,e.c2.y,e.end.x,e.end.y),i=e.end;return t}var Y=class Y extends _{constructor(){super(...arguments);this.config={type:"custom:futura-schematic-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 7}static getStubConfig(){return{type:"custom:futura-schematic-card"}}get entityPrefix(){return this.config.prefix??D}reading(t){return P(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}label(t){let e=C.collarX[t.collar];return l`
      <div
        class="reading"
        style=${`left:${e/Ii*100}%; top:${Pr/Wi*100}%`}
      >
        <span class="row">
          <ha-icon icon="mdi:thermometer" style=${`color:${t.colour}`}></ha-icon>
          ${Y.decimal(this.reading(t.temp))} °C
        </span>
        <span class="row">
          <ha-icon icon="mdi:water-percent"></ha-icon>
          ${Y.decimal(this.reading(t.humidity),0)} %
        </span>
      </div>
    `}static arrow(t){let e=C.collarX[t.collar],r=Math.round(C.body.w*.019),n=Math.round(C.body.w*.047),{top:a,bottom:o}=Fi,c=t.into?o:a,h=t.into?a:o,m=t.into?c-n:c+n,u=`M ${e-r} ${h} L ${e-r} ${m} L ${e-n} ${m} L ${e} ${c} L ${e+n} ${m} L ${e+r} ${m} L ${e+r} ${h} Z`;return $`<path d=${u} fill=${t.colour} />`}static house(){let t=(C.collarX[2]+C.collarX[3])/2,e=Fi.bottom-26,r=26;return $`
      <path d=${`M ${t-r} ${e} L ${t} ${e-r*.8} L ${t+r} ${e} M ${t-r*.72} ${e-3} L ${t-r*.72} ${e+r*.62} L ${t+r*.72} ${e+r*.62} L ${t+r*.72} ${e-3}`}
            fill="none" stroke=${S.dim} stroke-width="3.4"
            stroke-linecap="round" stroke-linejoin="round" />
    `}filter(){let{x:t,y:e,w:r}=C.body,n=Math.round(r*.4),a=t+(r-n)/2,o=e+24,c=C.lidH-48,h=this.reading("filter_clogging");return $`
      <rect x=${a} y=${o} width=${n} height=${c} rx="10"
            fill=${S.panel} stroke=${S.panelEdge} stroke-width=${H} />
      <text x=${a+n/2} y=${o+c*.44} text-anchor="middle"
            font-size="23" font-weight="700" fill=${S.ink}>
        ${h===void 0?"--":Math.round(h)} %
      </text>
      <text x=${a+n/2} y=${o+c*.82} text-anchor="middle"
            font-size="16" fill=${S.dim}>${f(this.hass,"filter")}</text>
    `}static streams(){let{x:t,y:e,w:r,h:n}=C.body,a=e+C.lidH+18,o=e+Math.round(n*.93),c=t+r/2,h=Math.round(r*.055),m=Math.round(r*.2),u=(L,I)=>{let x=C.collarX[L],K=C.collarX[I],q=Math.sign(K-x),Q=x+q*m,Pt=.5523*h;return{start:{x,y:a},segments:[Bi({x,y:a},{x,y:o-h}),{c1:{x,y:o-h+Pt},c2:{x:x+q*(h-Pt),y:o},end:{x:x+q*h,y:o}},Bi({x:x+q*h,y:o},{x:Q,y:o}),{c1:{x:Q+(K-Q)*.22,y:o},c2:{x:K,y:a+(o-a)*.4},end:{x:K,y:a}}]}},g=Math.round(r*.11),w=(L,I,x,K)=>$`
      <linearGradient id=${L} gradientUnits="userSpaceOnUse"
                      x1=${I} y1="0" x2=${x} y2="0">
        ${K.map((q,Q)=>$`
          <stop offset=${`${Q/(K.length-1)*100}%`} stop-color=${q} />
        `)}
      </linearGradient>
    `,M=[{leg:u(0,2),stream:"supply"},{leg:u(3,1),stream:"extract"}];return $`
      <defs>
        <!-- outdoor air enters left of the exchanger, supply leaves to its right -->
        ${w("futura-stream-supply",c-g,c+g,Kt)}
        <!-- extract enters right of it, waste leaves to its left -->
        ${w("futura-stream-extract",c+g,c-g,wt)}
      </defs>
      <g fill="none" stroke-width=${Jt} stroke-linecap="butt" opacity="0.82">
        ${M.map(({leg:L,stream:I})=>{let x=Number(Qt(Hr(L),Nr,Jt));return $`
            <path d=${Ur(L)} stroke=${`url(#futura-stream-${I})`}
                  stroke-dasharray=${`${Jt} ${x-Jt}`} />
          `})}
      </g>
    `}fans(){let{y:t,h:e}=C.body,r=t+Math.round(e*.735),n=(a,o,c,h,m)=>$`
      <text x=${a} y=${r} text-anchor=${o} font-size="17" fill=${S.fainter}>
        ${f(this.hass,c)}
      </text>
      <text x=${a} y=${r+27} text-anchor=${o}
            font-size="24" font-weight="700" fill=${S.ink}>
        ${h===void 0?"--":Math.round(h)} %
      </text>
      <text x=${a} y=${r+51} text-anchor=${o} font-size="18" fill=${S.dim}>
        ${m===void 0?"--":Math.round(m)} ${f(this.hass,"rpm")}
      </text>
    `;return $`
      ${n(C.collarX[0]+34,"start","supply",this.reading("supply_fan_output"),this.reading("supply_fan_speed"))}
      ${n(C.collarX[3]-34,"end","exhaust",this.reading("exhaust_fan_output"),this.reading("exhaust_fan_speed"))}
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <svg viewBox="0 0 ${Ii} ${Wi}" role="img"
               aria-label=${f(this.hass,"ariaService")}>
            ${zi.map(e=>Y.arrow(e))}
            ${Y.house()}
            ${Di(C)}
            ${Pi(C,H)}
            ${Y.streams()}
            ${this.filter()}
            ${this.fans()}
          </svg>
          ${zi.map(e=>this.label(e))}
        </div>
      </ha-card>
    `:l`<ha-card>
        ${O(f(this.hass,"entityMissing",{entity:t}))}
      </ha-card>`}};Y.properties={hass:{attribute:!1},config:{state:!0}},Y.styles=[N,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${d(F)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${d(k.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${d(G)};
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
    `];var Se=Y;var Gi=900,V=Ct(124,560,170),y=V.body,Or=y.y+y.h+22,Tt=y.y+Math.round(y.h*.047),Z=y.y+Math.round(y.h*.905),T={y:y.y+Math.round(y.h*.147),r:Math.round(y.w*.042)},Rt=y.y+Math.round(y.h*.347),Ki=Math.round(y.h*.084),Ir={top:22,bottom:78},Lt=S.line,U={flow:.95,shell:.8,detail:.3,label:.75},Fr={top:y.y+Math.round(y.h*.711),mid:y.y+Math.round(y.h*.821),bottom:y.y+Math.round(y.h*.937),point:Math.round(y.w*.145),shoulder:Math.round(y.w*.073)},Wr=[.13,.532,.764].map(s=>y.y+Math.round(y.h*s)),Ae=Math.round(y.w*.027),R={dx:Math.round(y.w*.082),dy:Math.round(y.h*.056),wing:Math.round(y.w*.025)},zr=`${(V.collarX[0]-(V.collarX[1]-V.collarX[0])/2)/Gi*100}%`,Qe=[{flange:"A",collar:0,into:!0,colour:b.outside,temp:"outside_air_temperature",humidity:"outside_air_humidity"},{flange:"B",collar:1,into:!1,colour:b.waste,temp:"exhaust_air_temperature",humidity:"exhaust_air_humidity"},{flange:"C",collar:2,into:!1,colour:b.fresh,temp:"supply_air_temperature",humidity:"supply_air_humidity"},{flange:"D",collar:3,into:!0,colour:b.inside,temp:"extract_air_temperature",humidity:"extract_air_humidity"}],E=class E extends _{constructor(){super(...arguments);this.config={type:"custom:futura-diagram-card"}}setConfig(t){if(!t)throw new Error("Missing configuration");this.config={...t}}getCardSize(){return 8}static getStubConfig(){return{type:"custom:futura-diagram-card"}}get entityPrefix(){return this.config.prefix??D}reading(t){return P(this.hass,`${this.entityPrefix}_${t}`)}static decimal(t,e=1){return t===void 0?"--":t.toFixed(e).replace(".",",")}pill(t){return l`
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
    `}static arrow(t){let e=V.collarX[t.collar],{top:r,bottom:n}=Ir,a=t.into?n:r,o=t.into?r:n,c=t.into?-1:1,h=Math.round(y.w*.022);return $`
      <path d=${`M ${e} ${o} L ${e} ${a} M ${e-h} ${a+c*h*1.3} L ${e} ${a} L ${e+h} ${a+c*h*1.3}`}
            fill="none" stroke=${t.colour} stroke-width=${xt}
            stroke-opacity=${U.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static casing(){let{x:t,y:e,w:r,h:n}=y,a=e+V.lidH;return $`
      <g fill="none" stroke=${Lt} stroke-linecap="round" stroke-linejoin="round">
        ${V.collarX.map(o=>$`
          <rect x=${o-V.collarW/2} y=${e-Ki}
                width=${V.collarW} height=${Ki}
                stroke-width=${gt} stroke-opacity=${U.shell} />
        `)}
        <rect x=${t} y=${e} width=${r} height=${n} rx=${y.r}
              stroke-width=${H} stroke-opacity=${U.shell} />
        <path d=${`M ${t+9} ${e+20} L ${t+9} ${e+44} M ${t+r-9} ${e+20} L ${t+r-9} ${e+44}`}
              stroke-width=${fe} stroke-opacity=${U.detail} />
        ${Zt(y,a,gt)}
      </g>
    `}static fan(t,e,r){let{r:n}=T,a=n*.62,o=e?T.y-a:T.y+a,c=e?T.y+a*.72:T.y-a*.72;return $`
      <circle cx=${t} cy=${T.y} r=${n} fill=${F}
              stroke=${Lt} stroke-width=${gt} stroke-opacity=${U.shell} />
      <path d=${`M ${t-a} ${c} L ${t+a} ${c} L ${t} ${o} Z`}
            fill=${r} fill-opacity=${U.flow} />
    `}static head(t,e,r,n,a,o=Math.round(y.w*.019),c=xt){let h=Math.hypot(r,n)||1,m=r/h,u=n/h,g=t-m*o*1.3,w=e-u*o*1.3;return $`
      <path d=${`M ${g-u*o} ${w+m*o} L ${t} ${e} L ${g+u*o} ${w-m*o}`}
            fill="none" stroke=${a} stroke-width=${c}
            stroke-opacity=${U.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static chevrons(t,e,r,n){let a=r>e,o=Math.round(y.w*.02),c=Math.min(e,r)+o,h=Math.max(e,r)-o,m=Wr.filter(u=>u>=c&&u<=h);return $`
      <path d=${m.map(u=>`M ${t-o} ${u-(a?o:-o)} L ${t} ${u} L ${t+o} ${u-(a?o:-o)}`).join(" ")}
            fill="none" stroke=${n} stroke-width=${xt}
            stroke-opacity=${U.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `}static flow(t){let[e,r,n,a]=V.collarX,{top:o,mid:c,bottom:h,point:m,shoulder:u}=Fr,g=y.x+y.w/2,w=g-m,M=g+m,L=g-u,I=g+u,x=(tt,et,ei,qi,Xi)=>ei+(tt-et)/(qi-et)*(Xi-ei),K=(tt,et)=>tt+(et-tt)*(Z-c)/(h-c),q=x(r,w,c,L,o)-Ae,Q=x(n,M,c,I,o)-Ae,Pt=K(w,L)-Ae,Je=K(M,I)+Ae,te=Math.round(y.w*.026),Nt=(r+n)/2,ee=(tt,et)=>$`
      <circle cx=${tt} cy=${Rt} r=${xt*1.4}
              fill=${et} fill-opacity=${U.flow} />
    `,J=(tt,et)=>$`
      <path d=${tt} fill="none" stroke=${et} stroke-width=${xt}
            stroke-opacity=${U.flow}
            stroke-linecap="round" stroke-linejoin="round" />
    `,[$t,ti,dt,Ut]=Qe;return $`
      <!-- A: outdoor air down and into the exchanger -->
      ${J(`M ${e} ${Tt} L ${e} ${Z} L ${Pt} ${Z}`,$t.colour)}
      <!-- B: waste up from the exchanger's upper-left slant -->
      ${J(`M ${r} ${q} L ${r} ${Tt}`,ti.colour)}
      <!-- C: supply up through its fan -->
      ${J(`M ${n} ${Q} L ${n} ${T.y+T.r}`,dt.colour)}
      ${J(`M ${n} ${T.y-T.r} L ${n} ${Tt}`,dt.colour)}
      <!-- D: extract down through its fan and into the exchanger -->
      ${J(`M ${a} ${Tt} L ${a} ${T.y-T.r}`,Ut.colour)}
      ${J(`M ${a} ${T.y+T.r} L ${a} ${Z} L ${Je} ${Z}`,Ut.colour)}

      <!--
        The bypass, taking outdoor air straight to supply past the exchanger. Two
        colours, changing at the damper: what is upstream of it is still outdoor
        air, what is downstream of it is supply.
      -->
      ${J(`M ${e} ${Rt} L ${Nt-te} ${Rt}`,$t.colour)}
      ${J(`M ${Nt+te} ${Rt} L ${n} ${Rt}`,dt.colour)}
      ${ee(e,$t.colour)}
      ${ee(Nt-te,$t.colour)}
      ${ee(Nt+te,dt.colour)}
      ${ee(n,dt.colour)}
      <text x=${Nt} y=${Rt+Math.round(y.w*.048)}
            text-anchor="middle" font-size=${Math.round(y.w*.027)}
            letter-spacing="1.1" fill=${Lt}
            fill-opacity=${U.label}>${f(t,"bypass")}</text>

      <!-- the exchanger, and the crossing that names it -->
      <g fill="none" stroke=${Lt} stroke-linecap="round" stroke-linejoin="round">
        <path d=${`M ${w} ${c} L ${L} ${o} L ${I} ${o} L ${M} ${c} L ${I} ${h} L ${L} ${h} Z`}
              stroke-width=${H} stroke-opacity=${U.shell} />
        <path d=${`M ${g-R.dx} ${c+R.dy} L ${g+R.dx} ${c-R.dy} M ${g+R.dx} ${c+R.dy} L ${g-R.dx} ${c-R.dy}`}
              stroke-width=${gt} stroke-opacity=${U.shell} />
      </g>
      <!--
        The cross's heads at the cross's own weight. Left at the runs' pipe weight
        they read bolder than the arms they belong to, which made a correctly
        proportioned head look oversized.
      -->
      <g stroke-opacity=${U.shell}>
        ${E.head(g+R.dx,c-R.dy,R.dx,-R.dy,Lt,R.wing,gt)}
        ${E.head(g-R.dx,c-R.dy,-R.dx,-R.dy,Lt,R.wing,gt)}
      </g>

      <!-- direction marks: the legs in, the two runs out, and the chevrons -->
      ${E.head(Pt,Z,1,0,$t.colour)}
      ${E.head(Je,Z,-1,0,Ut.colour)}
      <!--
        No arrowhead where a run leaves the unit. The block arrow above its collar
        already says which way that duct flows, so a head just inside the casing
        repeated it a few units lower down.
      -->
      ${E.chevrons(e,Tt,Z,$t.colour)}
      ${E.chevrons(r,q,Tt,ti.colour)}
      ${E.chevrons(n,Q,T.y+T.r,dt.colour)}
      ${E.chevrons(a,T.y+T.r,Z,Ut.colour)}

      ${E.fan(n,!0,dt.colour)}
      ${E.fan(a,!1,Ut.colour)}
    `}render(){if(!this.hass)return l`<ha-card></ha-card>`;let t=`${this.entityPrefix}_outside_air_temperature`;return this.hass.states[t]?l`
      <ha-card>
        ${this.config.title?l`<div class="title">${this.config.title}</div>`:p}
        <div class="stage">
          <div class="labels">${Qe.map(e=>this.pill(e))}</div>
          <svg viewBox="0 0 ${Gi} ${Or}" role="img"
               aria-label=${f(this.hass,"ariaDiagram")}>
            ${Qe.map(e=>E.arrow(e))}
            ${E.casing()}
            ${E.flow(this.hass)}
          </svg>
        </div>
      </ha-card>
    `:l`<ha-card>
        ${O(f(this.hass,"entityMissing",{entity:t}))}
      </ha-card>`}};E.properties={hass:{attribute:!1},config:{state:!0}},E.styles=[N,A`
      :host {
        display: block;
      }

      ha-card {
        background: ${d(F)};
        border: none;
        box-shadow: none;
        padding: 0;
        border-radius: ${d(k.canvas)};
        overflow: hidden;
      }

      .title {
        padding: 16px 18px 0;
        font-size: 1.05rem;
        font-weight: 600;
        color: ${d(G)};
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
        padding: 14px ${d(zr)} 8px;
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
    `];var Ce=E;var B={flow:{option:"variantFlow",tag:"futura-flow-card",label:"variantFlowLabel",hint:"variantFlowHint"},unit:{option:"variantUnit",tag:"futura-unit-card",label:"variantUnitLabel",hint:"variantUnitHint"},service:{option:"variantService",tag:"futura-schematic-card",label:"variantServiceLabel",hint:"variantServiceHint"},diagram:{option:"variantDiagram",tag:"futura-diagram-card",label:"variantDiagramLabel",hint:"variantDiagramHint"}},Ee="flow",Dt=class Dt extends _{constructor(){super(...arguments);this.config={type:"custom:futura-schematics-card"}}set hass(t){let e=this.variant;if(this._hass=t,this.variant!==e){this.child=void 0,this.requestUpdate();return}this.child&&(this.child.hass=t)}get hass(){return this._hass}setConfig(t){if(!t)throw new Error("Missing configuration");let e=t.variant??Ee;if(!(e in B))throw new Error(`Unknown variant "${e}". Pick one of: ${Object.keys(B).join(", ")}.`);this.config={...t},this.child=void 0}static getStubConfig(){return{type:"custom:futura-schematics-card",variant:Ee}}static getConfigElement(){return document.createElement("futura-schematics-card-editor")}static normalise(t){return t.toLowerCase().replace(/[^\p{L}\p{N}]/gu,"")}match(t){let e=Dt.normalise(t),r=(n,a)=>Dt.normalise(f(a,n))===e;return Object.keys(B).find(n=>n===e||r(B[n].option,this._hass)||r(B[n].option,void 0))}get variant(){return this.selected??this.config.variant??Ee}get helperState(){let t=this.config.variant_entity;return t?this._hass?.states[t]?.state:void 0}get selected(){let t=this.helperState;if(!(t===void 0||t==="unavailable"||t==="unknown"))return this.match(t)}get unmatched(){let t=this.config.variant_entity;if(!t)return;let e=this.helperState;if(e===void 0)return f(this._hass,"entityMissing",{entity:t});if(!(e==="unavailable"||e==="unknown")&&!this.match(e))return f(this._hass,"optionUnknown",{entity:t,state:e,options:Object.values(B).map(r=>f(this._hass,r.option)).join(", ")})}getCardSize(){return this.child?.getCardSize?.()??7}get card(){let{tag:t}=B[this.variant];if(customElements.get(t)){if(!this.child){let{type:e,variant:r,variant_entity:n,...a}=this.config,o=document.createElement(t);o.setConfig({type:`custom:${t}`,...a}),o.hass=this._hass,this.child=o}return this.child}}render(){let t=this.unmatched;if(t)return l`<ha-card>${O(t)}</ha-card>`;let e=this.card;return e?l`${e}`:l`<ha-card>
        ${O(f(this._hass,"cardMissing",{tag:B[this.variant].tag}))}
      </ha-card>`}};Dt.properties={hass:{attribute:!1},config:{state:!0}},Dt.styles=A`
    :host {
      display: block;
    }
  `;var Te=Dt,Mt=class extends _{constructor(){super(...arguments);this.config={type:"custom:futura-schematics-card"};this.label=t=>{let r={variant:"editorVariant",variant_entity:"editorVariantEntity",prefix:"editorPrefix",title:"editorTitle"}[t.name];return r?f(this.hass,r):t.name}}setConfig(t){this.config={...t}}get schema(){return[{name:"variant",selector:{select:{mode:"dropdown",options:Object.entries(B).map(([t,e])=>({value:t,label:f(this.hass,e.label)}))}}},{name:"variant_entity",selector:{entity:{domain:["input_select","select"]}}},{name:"prefix",selector:{text:{}}},{name:"title",selector:{text:{}}}]}changed(t){t.stopPropagation();let e={...this.config,...t.detail.value};for(let r of["prefix","title","variant_entity"])e[r]===""&&delete e[r];this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){let t=this.config.variant??Ee;return l`
      <ha-form
        .hass=${this.hass}
        .data=${{variant:t,...this.config}}
        .schema=${this.schema}
        .computeLabel=${this.label}
        @value-changed=${this.changed}
      ></ha-form>
      <div class="hint">
        ${B[t]?f(this.hass,B[t].hint):p}
      </div>
    `}};Mt.properties={hass:{attribute:!1},config:{state:!0}},Mt.styles=A`
    .hint {
      padding: 8px 4px 0;
      font-size: 0.85rem;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
  `;var Vi=[{type:"futura-flow-card",name:"Futura air flow",description:"Airflow schematic with duct temperatures, humidity, recovered heat and filter status.",preview:!0,element:ye},{type:"futura-control-card",name:"Futura controls",description:"Ventilation level, temperature target and timed functions.",preview:!0,element:kt},{type:"futura-sensor-grid-card",name:"Futura sensor grid",description:"CO₂, temperature or humidity tiles for every connected peripheral.",preview:!0,element:St},{type:"futura-history-card",name:"Futura sensor history",description:"History graph of CO₂, temperature or humidity across every connected peripheral.",preview:!0,element:At},{type:"futura-unit-card",name:"Futura unit schematic",description:"The unit and its four ducts, with each duct's temperature and humidity and the current operating mode.",preview:!0,element:ke},{type:"futura-schematic-card",name:"Futura service schematic",description:"The unit with airflow direction, per-duct readings, both fan speeds and filter wear -- the service view.",preview:!0,element:Se},{type:"futura-diagram-card",name:"Futura airflow diagram",description:"The manual's airflow diagram as a line drawing: runs, bypass, both fans and the exchanger.",preview:!0,element:Ce},{type:"futura-schematics-card",name:"Futura schematic (pick one)",description:"Any one of the four views of the unit, chosen in the card's settings.",preview:!0,element:Te}];customElements.get("futura-schematics-card-editor")||customElements.define("futura-schematics-card-editor",Mt);var ji=window.customCards||=[];for(let s of Vi)if(customElements.get(s.type)||customElements.define(s.type,s.element),!ji.some(i=>i.type===s.type)){let{element:i,...t}=s;ji.push(t)}console.info(`%c FUTURA-CARDS %c ${Vi.length} cards registered `,`background:${ue};color:${bt}`,"");export{kt as FuturaControlCard,Ce as FuturaDiagramCard,ye as FuturaFlowCard,At as FuturaHistoryCard,Se as FuturaSchematicCard,Te as FuturaSchematicsCard,Mt as FuturaSchematicsCardEditor,St as FuturaSensorGridCard,ke as FuturaUnitCard};
