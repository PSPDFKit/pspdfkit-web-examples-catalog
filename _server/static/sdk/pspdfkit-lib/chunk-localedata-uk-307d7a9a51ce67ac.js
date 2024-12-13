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
(globalThis.webpackChunkPSPDFKit=globalThis.webpackChunkPSPDFKit||[]).push([[1843],{98621:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","few","many","other"],ordinal:["few","other"]},fn:function(e,l){var a=String(e).split("."),t=a[0],n=!a[1],o=Number(a[0])==e,i=o&&a[0].slice(-1),r=o&&a[0].slice(-2),u=t.slice(-1),c=t.slice(-2);return l?3==i&&13!=r?"few":"other":n&&1==u&&11!=c?"one":n&&u>=2&&u<=4&&(c<12||c>14)?"few":n&&0==u||n&&u>=5&&u<=9||n&&c>=11&&c<=14?"many":"other"}},locale:"uk"})}}]);