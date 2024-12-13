/*!
 * PSPDFKit for Web 0.0.0-dev (https://pspdfkit.com/web)
 *
 * Copyright (c) 2016-2024 PSPDFKit GmbH. All rights reserved.
 *
 * THIS SOURCE CODE AND ANY ACCOMPANYING DOCUMENTATION ARE PROTECTED BY INTERNATIONAL COPYRIGHT LAW
 * AND MAY NOT BE RESOLD OR REDISTRIBUTED. USAGE IS BOUND TO THE PSPDFKIT LICENSE AGREEMENT.
 * UNAUTHORIZED REPRODUCTION OR DISTRIBUTION IS SUBJECT TO CIVIL AND CRIMINAL PENALTIES.
 * This notice may not be removed from this file.
 *
 * PSPDFKit uses several open source third-party components: https://pspdfkit.com/acknowledgements/web/
 */
(globalThis.webpackChunkPSPDFKit=globalThis.webpackChunkPSPDFKit||[]).push([[3424],{3340:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","many","other"],ordinal:["many","other"]},fn:function(a,l){var t=String(a),e=t.split(/[ce]/),n=e[1]||0,o=String(n?Number(e[0])*Math.pow(10,n):t).split("."),r=o[0],i=!o[1],u=r.slice(-6);return l?11==a||8==a||80==a||800==a?"many":"other":1==a&&i?"one":0==n&&0!=r&&0==u&&i||n<0||n>5?"many":"other"}},locale:"it"})}}]);