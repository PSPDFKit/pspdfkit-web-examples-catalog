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
(globalThis.webpackChunkPSPDFKit=globalThis.webpackChunkPSPDFKit||[]).push([[6523],{46751:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","few","many","other"],ordinal:["other"]},fn:function(l,a){var e=String(l).split("."),t=e[0],n=!e[1],o=t.slice(-1),r=t.slice(-2);return a?"other":1==l&&n?"one":n&&o>=2&&o<=4&&(r<12||r>14)?"few":n&&1!=t&&(0==o||1==o)||n&&o>=5&&o<=9||n&&r>=12&&r<=14?"many":"other"}},locale:"pl"})}}]);