# MMM-CustomElementTime
> As always, README is longer than the codes. What's wrong in my modules.

  - Author: Seongnoh Sean Yi <eouia0819@gmail.com>
  - Repository : https://github.com/MMRIZE/MMM-CustomElementTime
  - Version: 1.0.0 (2021-09-24)

![image](https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CustomElementTime/ce_sample3.png)


## [TOC]
- [I. Motivation & Concept](#4e4c6a9aa9e5467daebcaf87fdef95ba)
- [II. Installation & Setup](#d6178e503e6ed6906904cffe2bfbeb2f)
  - [Install](#349838fb1d851d3e2014b9fe39203275)
  - [Upgrade your Electron to latest](#f09d24b60c9c98008b689cf708df36e9)
  - [Config](#fa535ffb25e1fd20341652f9be21e06e)
    - [Usual case;](#16710ad600c8f2d978ba394ceadb85dd)
    - [For experts;](#71c4dabd9d1425d398665323a1da656b)
- [III. **`<mm-time>`** spec](#a2b26c3b9eb7a30e228de187670a274e)
  - [General](#0db377921f4ce762c62526131097968f)
  - [Attributes & reflexed properties](#cd4182d7210da66deb2813c3381723a5)
    - [`time="<DateTimeValue>"`](#45f2c7a8f50f027edab974bd1b649990)
    - [`refresh="<milliseconds>"`](#5a9bf5c273bf9daefdfa0c3c47e2b7b1)
    - [`relative`](#5bd0807e4928f618bc11c94cd8096d12)
    - [`relative-unit="<UnitText>"`](#06733a791e2fb60c9c3dea34f1a4e8c9)
    - [`relative-reverse`](#4469d876c4edfb2f4395d34a14c3cd0d)
    - [`relative-quarter`](#66a2709d134b7c37262ba1db18e2db0a)
    - [`range="<DateTimeValue>"`](#cc4aa98bdd33c8ddd852aec263560f02)
    - [`locale="<LocaleText>"`](#d58dfd55cc1eb976608036c09dc33f9f)
    - [`data-*="<Options>"`](#999e8413e02ead874bf8264fcafd7fb1)
    - [`decouple`](#de225056cebca0f56c327c1dbb27d9c4)
    - [`formatter="<formatterNameList>"`](#71697a56d7aa7aa765d70aab2b03ab4d)
  - [Custom Events](#07ecc640d712822188662d78b4b972d1)
    - [CustomEvent: `updated`](#4450d62f8f524f25acfaa7580e527b01)
    - [CustomEvent: `passed`](#adde9c4b264d823a0cd30c1a28229614)
  - [Event Handler](#62f33cfe56c08aff82d11e658e572951)
  - [DOM Methods](#4aafe9b0c5e543a4b949bbf2bd682ee5)
    - [`.update()`](#258edab0abc28cb0a8549aa1667063b4)
- [IV. Example](#90f85ead46fc6cc700075840f0ba0776)
  - [A. Living as a minority](#458447468eb90ec08d1b8da814c85c30)
  - [B. Self-refreshable time](#2a6bb105322df4f9c3991e5bc9fd58dd)
  - [C. Alternative default clock module (meaningless but funny :D)](#3cde94417fca30aee4f6490f236eac46)
  - [D. Custom Formatting (Weird)](#f279c2919acda929e96dbadf320c15ed)
  - [E. World clock](#e28f61ccb7c50ec7f116013b9cc4f224)
  - [F. Alarm feature in your module.](#878f8c689a550fed1c7495a8e079a692)
  - [G. Displaying Range](#7bdb9c11b3239431a80ad36af6e95a1d)

<!-- Table of contents is made with https://github.com/evgeniy-khist/markdown-toc -->


## <a id="4e4c6a9aa9e5467daebcaf87fdef95ba"></a>I. Motivation & Concept
Tons of MM modules have been handling time-related stuff for many years. A module developer needs to implement their logic to display "in 5 minutes" or "Friday, 25. December". Yup. It looks pretty straightforward at first glance until considering customizability or localization features. There was a relatively easy solution like `momentJS`. But now we are facing of deprecation of `momentJS`. Maybe `luxon` would be the best alternative, but...

JavaScript environment is evolving every day so fast. Now we can obtain brand new weapons - `Custom Element` and `Intl`. I think these new features could enable to change the whole things of Javascript applications, including MagicMirror.

This MM module gives the custom element `<mm-time>`, which can **`display time`** in the MM screen anywhere.

This module is not just for average users, and even more, it is a THING for developers. However, even ordinary users can use this tag wherever they want, and HTML is allowed. For example, you can put this `<mm-time>` tag in the `helloworld` module to display your custom world-clocks or event countdown.

For the developer, you can use this tag to reduce your code and not worry about handling displaying time. With just inserting `<mm-time>` into your module's screen output, you don't need to make logic for taking time-related stuff by yourself. Additionally, this tag can give more than your expectation.

This module and custom tag `<mm-time>` is made with only pure Javascript. Without `momentJS` or something 3rd Party dependency, probably you can handle the time how to show, I hope. (But the calculation of time is a different perspective.)

## <a id="d6178e503e6ed6906904cffe2bfbeb2f"></a>II. Installation & Setup
### <a id="349838fb1d851d3e2014b9fe39203275"></a>Install
```sh
cd ~/MagicMirror/modules
git clone https://github.com/MMM-CustomElementTime 
```

### <a id="f09d24b60c9c98008b689cf708df36e9"></a>Upgrade your Electron to latest
It's better to upgrade your Electron dependency to use new features fully.
```sh
cd ~/MagicMirror
npm install electron@latest --save-optional
```
You might need to upgrade/rebuild other 3rd party MM modules to obtain compatibility.

In the case of `serveronly` mode, you may need a newer updated browser. (e.g. Chrome/Chromium > v92 - 2021 Jun.)

### <a id="fa535ffb25e1fd20341652f9be21e06e"></a>Config
> This module doesn't have its own real estate in the MM screen. Don't set `position`.
#### <a id="16710ad600c8f2d978ba394ceadb85dd"></a>Usual case;
```js
{
  module: 'MMM-CustomElementTime'
},
```
#### <a id="71c4dabd9d1425d398665323a1da656b"></a>For experts;
```js
{
  module: 'MMM-CustomElementTime',
  config: {
    locale: 'de-DE', // By default, MM's global locale will be used unless this value exists.
    customFormatter: {
      "myFormatter": (parts) => { ... },
    }
  }
},
```
- `locale` : Set default locale of `<mm-time>` tag.
- `customFormatter` : Set custom formatters to customize output. 

Then, put **`<mm-time>`** anywhere you want.

## <a id="a2b26c3b9eb7a30e228de187670a274e"></a>III. **`<mm-time>`** spec

### <a id="0db377921f4ce762c62526131097968f"></a>General
- This tag is extended from normal `HTML` element, so all the general behaviours (attribute, event, method, attribute-property reflection, etc.) of normal HTML tags have also.
- Format: `<mm-time attributes="..." ...>Fallback Message</mm-time>`
  - Fallback Message would be shown when `mm-time` is not working properly.
  - so `<mm-time time="2021-12-25">2021-12-25</mm-time>` would be the safe fallback format.
  - Self-closing `<mm-time/>` format is not allowed by HTML custom element spec definition.
- By default, `<mm-time>` has `inline-block` as CSS display property. You can override in your CSS definitions.
- This tag's will be **refreshed** when; 
  1) tag is connected to DOM, 
  2) some core attribute('time', 'range', etc.) is changed, 
  3) refreshing by `refresh` interval attribute.
  4) Forcely refreshed by `.update()` method.
- JS DOM Manipulating also be possible.
```JS
var eventTime = document.createElement('mm-time')
eventTime.time = new Date('2021-12-25 12:34:56')
document.getElementById('somethinhg').appendChild(eventTime)
eventTime.update()
```
### <a id="cd4182d7210da66deb2813c3381723a5"></a>Attributes & reflexed properties
#### <a id="45f2c7a8f50f027edab974bd1b649990"></a>`time="<DateTimeValue>"`
- as DOM property: `.time` (ms Number | text | Date Object)

This attribute is for setting target time to display. If omitted, the current time(when connected or refreshed) will be used.
```HTML
<mm-time></mm-time>                            // Current time
<mm-time time="2021-12-25 12:34"></mm-time>    // Target time as date-like text
<mm-time time="1632431481000"></mm-time>       // Target time as epoch timestamp
```
`time` attribute could have the value `UNIX epoch timestamp (ms)` or `date-like text`([RFC 2822](https://datatracker.ietf.org/doc/html/rfc2822#page-14) or [ISO 8601](https://262.ecma-international.org/11.0/#sec-date.parse)). `date-like text` would make unexpected result due to browser compatibility, so `timestamp(ms)` would be recommended. (Anyway, most modern browsers can handle it properly.)

As a property of DOM manipulating, `.time` property setter can get `Date Object`. In this case, `time` attribute will get the timestamp value from the Date object as the reflection of the property `.time`.
```js
mmtimeTag.time = new Date('2021-01-01') // or "2021-01-01" or "1609459200000" or 1609459200000
console.log(mmtimeTag.getAttribute('time')) // => "1609459200000"
```

#### <a id="5a9bf5c273bf9daefdfa0c3c47e2b7b1"></a>`refresh="<milliseconds>"`
- as DOM property: `.refresh` (number)

You can redraw the tag periodically with this attribute.
```HTML
<mm-time data-time-style="long" refresh="1000"></mm-time> // It will refresh the output per 1 sec. 
```


#### <a id="5bd0807e4928f618bc11c94cd8096d12"></a>`relative`
- as DOM property: `.relative` (boolean)

This attribute decide absolute DateTimeFormat ("Friday, 24, September 11:30 AM") or relative format ("3 hours ago").
If the `range` attribute is set, `relative` attribute will be ignored. (will be displayed as 'absolute')
```HTML
<mm-time time="2021-12-25 12:34:56"></mm-time>
// By default, absolute format will be the output like "25/12/2021"
<mm-time time="2021-12-25 12:34:56" relative></mm-time> 
// relative format : "in 2 months"
<mm-time time="2021-12-25 12:34:56" range="2021-12-31 11:59:59" relative></mm-time> 
// 'relative' attribute will be ignored and the output will be the range format
```


#### <a id="06733a791e2fb60c9c3dea34f1a4e8c9"></a>`relative-unit="<UnitText>"`
- as DOM property: `.relativeUnit` (text)

This will be effective only with `type="relative"`.
```HTML
<mm-time time="2021-12-25 12:34:56" relative-unit="minute" relative></mm-time> /* "in 1,234,567 minutes" */
<mm-time time="2021-12-25 12:34:56" relative-unit="auto" relative></mm-time> /* "in 2 months" */
<mm-time time="2021-12-25 12:34:56" relative></mm-time> /* "in 2 months" */
```
Available values are `year`, `quarter`, `month`, `week`, `day`, `hour`, `minute`, `second` and their plural forms.(e.g. `years`). The default value is omittable `auto`. `auto` will seek and show the best-humanized matching value to avoid too ridiculousy big number.

#### <a id="4469d876c4edfb2f4395d34a14c3cd0d"></a>`relative-reverse`
- as DOM property: `.relativeReverse`(boolean)

By default, relative time is calculated how far the target time be away `from now`. You can change the direction reversively.
```HTML
<mm-time time="2021-12-25" relative relative-unit="day"></mm-time>
// "in 92 days"
<mm-time time="2021-12-25" relative relative-unit="day" relative-reverse></mm-time>
// "92 days ago"
```

#### <a id="66a2709d134b7c37262ba1db18e2db0a"></a>`relative-quarter`
- as DOM property: `.relativeQuarter`(boolean)

Under some culture, `quarter` is unfamiliar unit to count periods. So `quarter` will be ignored by default in `auto` unit mode. When you want to use `quarter` in `auto` mode, use this attribute.
```HTML
<mm-time time="2020-12-25" relative></mm-time>
// "9 months ago"
<mm-time time="2020-12-25" relative relative-quarter></mm-time>
// "3 quarters ago"
```

#### <a id="cc4aa98bdd33c8ddd852aec263560f02"></a>`range="<DateTimeValue>"`
- as DOM property: `.range` (ms Number | text | Date Object)

When this attribute set, the output will be the Range Format (Shared parts, and Start/End parts). For example; `2021-12-25 12:34 - 2021-12-25 23:59` is sharing `2021-12-15, PM`, so it could be displayed like `December 25, 2021, 12:34 - 23:59 PM`.
```HTML
<mm-time time="2021-12-25 12:34:56" range="2021-12-25 23:59:59" data-date-style="long" data-time-style="short"></mm-time>
```

#### <a id="d58dfd55cc1eb976608036c09dc33f9f"></a>`locale="<LocaleText>"`
- as DOM property: `.locale` (text)

This attribute enables locale-aware output. Locale format is [BCP 47](https://tools.ietf.org/rfc/bcp/bcp47.txt). (`"en"`, `"en-US"`, `"en-US-u-ca-buddhist"`, etc. But `"en_US"` is not valid.)
```HTML
<mm-time></mm-time> 
// By default, MMM-CustomElementTime's config.locale or MM Global config.locale or system locale will be used.
// If your default locale is `en-US`, this will show "9/24/2021"
<mm-time locale="en-CA"></mm-time> 
// It will show AngloCanadian format; "2021-09-24"
```

#### <a id="999e8413e02ead874bf8264fcafd7fb1"></a>`data-*="<Options>"`
- as DOM property: `.dataSet` (object)

Each absolute/relative formats could have plenty options to format the output.
```HTML
<mm-time></mm-time>                         // "9/24/2021"
<mm-time data-day="2-digit"></mm-time>      // "24"
<mm-tiem data-date-style="full"></mm-time>  // "Friday, September 24, 2021"
<mm-time data-calendar="chinese"></mm-time> // "8/18/2021" <-- Chinese Lunar calendar
<mm-time time="2021-12-25" data-style="short" relative></mm-time> // "in 3 mo."
...
```
- For absolute format options: See [`options` part](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters)
- For relative format options: See [`options` part](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat#parameters)
- If you want to apply `month="numeric"` option for your output, appen prefix `'data-'` and describe like this; `data-month="numeric"`.
- HTML allows only lower-cased characters, then if you want to apply camelCased options like `timeStyle="long"`, dash-conversion is needed like this; `data-time-style="long"`
- Some options could not be used together. Read the above links.
- At this moment, some options might be misbehavioured in some environment due to Browser compatibility or implementation difference. Read above links. (Updating your browser/electron to the latest version will solve this issue.)


#### <a id="de225056cebca0f56c327c1dbb27d9c4"></a>`decouple`
- as DOM property: `.decouple` (boolean)

With this attribute, you can disassemble the output text to contextual HTML parts.
```HTML
<p>
  <mm-time data-time-style="medium"></mm-time><br/>
  <mm-time data-time-style="medium" decouple></mm-time>
</p>
```
will seems having same screen output; 
```
9:20:31 PM
9:20:31 PM
```
but will have different HTML
```HTML
<p>
  <mm-time data-time-style="medium">
    9:20:31 PM
  </mm-time>
  <br/>
  <mm-time data-time-style="medium" decouple="">
    <span class="mm-time-parts hour">9</span>
    <span class="mm-time-parts literal">:</span>
    <span class="mm-time-parts minute">20</span>
    <span class="mm-time-parts literal">:</span>
    <span class="mm-time-parts second">31</span>
    <span class="mm-time-parts literal"> </span>
    <span class="mm-time-parts dayPeriod">PM</span>
  </mm-time>
</p>
```
You can decorate the parts with CSS or can manipulate DOM.

#### <a id="71697a56d7aa7aa765d70aab2b03ab4d"></a>`formatter="<formatterNameList>"`
- as DOM property: `.formatter` (Array of string or list-like text)

You can use several formatters sequentially by describing them with comma or space separtor.
```HTML
<mm-time formatter="myFormat_1, myFormat_2 myFormat_3"></mm-time>
```

You can handle the parts themselves before displaying output on the MM screen with custom formatters. custom formatters are definable in `config.customFormatter: {}` or registrable from other modules via `notification` or direct-access of `.registerCustomFormatter()`

Or your module can register its own custom formatter by itself.

```js
// by public method of module
var CustomElementTimeModule = MM.getModules().find(module => (module.name === 'MMM-CustomElementTime'))
CustomElementTimeModule.registerCustomFormatter('myFormat', (parts) => {
  ...
})

// or by notification
var payload = {
  name: 'myFormat',
  callback: (parts) => {
    ...
  }
}
this.sendNotification('CETIME_REGISTER_CUSTOM_FORMATTER', payload)

```


See example how to use in Examples section.


### <a id="07ecc640d712822188662d78b4b972d1"></a>Custom Events
Usually, all general Events (e.g. 'click', 'loaded', ... etc.) will work. Additionally two custom events are added. Both custom event will have `detail` like this;
```js
{
  displayed,  // screen output of this tag when the event is fired.
  time, // Date object of target time when the event is fired.
}
```
#### <a id="4450d62f8f524f25acfaa7580e527b01"></a>CustomEvent: `updated`
This event will be fired when the tag is refreshed.

#### <a id="adde9c4b264d823a0cd30c1a28229614"></a>CustomEvent: `passed`
This event will be fired when the target time is passed. Time-passing will be checked on refresh time. So this event might not occur on exact target time.


### <a id="62f33cfe56c08aff82d11e658e572951"></a>Event Handler
For the two custom events, `onUpdated` and `onPassed` event handler is enabled.
```js
var eventTime = document.getElementById("eventTime")
eventTime.onUpdated = (event) => {
  console.log(event.target, event.detail)
}
```
Of course, you can use `.addEventListener(eventId, func)`.
```js
function alertOnce (event) {
  console.log(event.target, event.detail)
  event.target.removeEventListener('passed', this)
}
eventTime.addEventListener('passed', alertOnce)
```

> Careless handling event could become a common pitfall of `gc` fail of javascript. You need to be careful.



### <a id="4aafe9b0c5e543a4b949bbf2bd682ee5"></a>DOM Methods
#### <a id="258edab0abc28cb0a8549aa1667063b4"></a>`.update()`
You can update the tag forcely.
```js
var eventTime = document.getElementById("eventTime")
eventTime.update()
```





## <a id="90f85ead46fc6cc700075840f0ba0776"></a>IV. Example


### <a id="458447468eb90ec08d1b8da814c85c30"></a>A. Living as a minority
For who uses traditional Taiwanese living in Berlin with the Chinese calendar.
```HTML
<mm-time locale="zh-Hant-tw" data-numbering="hanidec" data-calendar="chinese" data-timezone="Europe/Berlin" data-date-style="long" data-time-style="medium"/></mm-time>
```
will show;
```
2021辛丑年八月十九 下午7:38:01
```

### <a id="2a6bb105322df4f9c3991e5bc9fd58dd"></a>B. Self-refreshable time
```HTML
...
<div class="article_pulished">
Published <mm-time time="2021-09-24 12:34" data-numeric="auto" relative refresh="60000">at 24/09/21 12:34 PM</mm-time>
</div>
... 
```
will show like these by time passing without redrawing the moudle's output.
```
Published 35 minutes ago
Published yesterday
Published 2 weeks ago
...
```
Even if your module is using `momentJS` to display this kind of relative time, you need to refresh or redraw output to reflect of the time passing by yourself. But `<mm-time>` will redraw itself automatically.


### <a id="3cde94417fca30aee4f6490f236eac46"></a>C. Alternative default clock module (meaningless but funny :D)
```js
{
  module: "helloworld",
  position: "top_left",
  header: 'mm-time custom tag in HelloWorld',
  config: {
    text: `
      <style>
      mm-time .mm-time-parts.second {
        font-size: 50%;
        line-height: 50%;
        color: var(--color-text-dimmed);
        vertical-align: super;
      }
      mm-time .mm-time-parts.minute + .mm-time-parts.literal {
        display:none;
      }
      </style>
      <mm-time class="date normal medium" data-date-style="full" refresh="1000"></mm-time><br/>
      <mm-time class="time bright large light" data-hour12="false" data-time-style="medium" refresh="1000" decouple></mm-time>
    `
  }
},

```
will make the `helloworld` module to display clock having exactly same look with the default clock module.

![image](https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CustomElementTime/ce_sample1.png)

### <a id="f279c2919acda929e96dbadf320c15ed"></a>D. Custom Formatting (Weird)
```js
{
  module: "MMM-CustomElementTime",
  config: {
    customFormatter: {
      "backwardSecond": (parts) => {
        for (i = 0; i < parts.length; i++) {
          let { type, value } = parts[i]
          if (type === 'second') {
            let backwardSecond = 59 - value
            parts[i].value = `<span style="color:red;">${backwardSecond}</span>`
          }
        }
        return parts
      },
      // ...
    }
  }
},
```

```HTML
<mm-time data-time-style="medium" refresh="1000" formatter="backwardSecond"></mm-time>
```
This will display red seconds that will run backward from 59 to 0. How weird.

![image](https://raw.githubusercontent.com/MMRIZE/public_ext_storage/main/MMM-CustomElementTime/ce_sample2.png)


### <a id="e28f61ccb7c50ec7f116013b9cc4f224"></a>E. World clock
```HTML
<p>
  Seoul : <mm-time data-day="numeric" data-weekday="long" data-hour="2-digit" data-minute="2-digit" data-time-zone="Asia/Seoul">Seoul time</mm-time><br/>
  New York : <mm-time data-day="numeric" data-weekday="long" data-hour="2-digit" data-minute="2-digit" data-time-zone="EST">New York time</mm-time><br/>
</p>

```
will show;
```
Seoul : 26 Sunday, 03:01 AM
New York : 25 Saturday, 01:01 PM
```

### <a id="878f8c689a550fed1c7495a8e079a692"></a>F. Alarm feature in your module.
```HTML
<mm-time id="alarm1" time="2021-09-24 17:00" relative relative-unit="second" refresh="1000"></mm-time>
```

```js
var alarm = document.getElementById('alarm1')
alarm.onPassed = () => {
  this.sendNotification('SHOW_ALERT', {
    message:'It is 17:00!!',
    timer: 5000
  })
  alarm.onPassed = null
}
```
This will show an alert on 17:00 (when the element would be updated by refresh = "1000")
### <a id="7bdb9c11b3239431a80ad36af6e95a1d"></a>G. Displaying Range
```HTML
The next event will take place on <mm-time time="2021-10-04" range="2021-10-08" data-month="short" data-day="numeric">2021-10-04 ~ 2021-10-08</mm-time>.
```
will show;
```
The next event will take place on Oct 4 - 8.
```