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
(globalThis.webpackChunkPSPDFKit=globalThis.webpackChunkPSPDFKit||[]).push([[9677],{2471:()=>{Intl.PluralRules&&"function"==typeof Intl.PluralRules.__addLocaleData&&Intl.PluralRules.__addLocaleData({data:{categories:{cardinal:["one","few","other"],ordinal:["other"]},fn:function(l,e){var a=String(l).split("."),t=a[0],n=a[1]||"",o=!a[1],i=t.slice(-1),r=t.slice(-2),c=n.slice(-1),s=n.slice(-2);return e?"other":o&&1==i&&11!=r||1==c&&11!=s?"one":o&&i>=2&&i<=4&&(r<12||r>14)||c>=2&&c<=4&&(s<12||s>14)?"few":"other"}},locale:"hr"})}}]);