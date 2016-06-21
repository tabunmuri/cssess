/**
 * CSSess
 * A bookmarklet for detecting unused CSS selectors and related info.
 * Copyright 2010 passive.ly LLC
 * @see http://github.com/driverdan/cssess
 *
 * @author Dan DeFelippi <dan@driverdan.com>
 * @license MIT license, see LICENSE
 */
var cssess = cssess || {};
cssess.baseUrl = "http://driverdan.github.com/cssess/";
cssess.siteUrl = window.location.protocol + "//" + window.location.hostname;
cssess.dataVersion = "1.0.0";
cssess.data = {};
cssess.v = {};
cssess.links = [];
cssess.checkStyles = function (e, f)
{
    var g = [];
    f = f || document;
    cssess.$("style", f).each(function ()
    {
        g = g.concat(cssess.parseCss(this.innerHTML, f))
    });
    if (g.length) {
        cssess.addUnused("inline styles (" + e + ")", g)
    }
    cssess.$("link[rel='stylesheet'][href!='']:not([href^='file:']):not([href^='chrome://'])", f).each(function ()
    {
        var d = this.href;
        if (!d.match(/^https?:\/\//) || d.indexOf(cssess.siteUrl) == 0) {
            cssess.$.get(d, function (a, b)
            {
                if (a) {
                    var c = cssess.parseCss(a, f);
                    if (c.length) {
                        cssess.addUnused(d, c)
                    }
                }
            })
        }
    })
};
cssess.start = function ()
{
    cssess.v.addLink(window.location.href);
    cssess.$("a[href!='']:not([href^='javascript:']):not([href^='#']):not([href^='mailto:']):not([href^='file:']):not([href^='chrome://'])").each(function ()
    {
        var a = this.href;
        if (!a.match(/^https?:\/\//) || (a.indexOf(cssess.siteUrl) == 0 && a != window.location)) {
            cssess.v.addLink(this.href)
        }
    })
};
cssess.parseCss = function (a, b)
{
    a = a.replace(/\/\*[\s\S]*?\*\//gim, "").replace(/[\n\t]/g, "");
    var c = a.match(/[^\}]+[\.\#\-\w]?(?=\{)/gim), missing = [], i;
    for (i in c) {
        try {
            if (!cssess.$(c[i], b).length) {
                missing.push(c[i])
            }
        } catch (e) {
        }
    }
    return missing
};
cssess.spider = function ()
{
    if (this.urls && this.urls.length) {
        var a = cssess.$("#cssesspider"), src = this.urls.pop();
        if (!a.length) {
            a = cssess.$('<iframe id="cssesspider" style="display:none"/>');
            a.load(function ()
            {
                try {
                    cssess.checkStyles(this.src, cssess.$(this).contents())
                } catch (e) {
                }
                cssess.spider()
            });
            a.appendTo(cssess.win)
        }
        if (src == window.location.href) {
            cssess.checkStyles(src)
        } else {
            a.attr("src", src)
        }
    } else {
        cssess.$("#cssesspider").remove()
    }
};
cssess.loadLinks = function ()
{
    cssess.urls = [];
    cssess.$("input[name='urls']:checked", cssess.win).each(function ()
    {
        cssess.urls.push(this.value)
    })
};
cssess.addUnused = function (a, b)
{
    cssess.data[a] = b;
    cssess.v.addUnused(a, b)
};
cssess.saveToJdrop = function (a)
{
    var b = {
        appname: "CSSess",
        title  : document.title,
        version: cssess.dataVersion,
        summary: a,
        json   : JSON.stringify(cssess.data)
    };
    var c = document.createElement("iframe");
    c.style.display = "none";
    c.name = "jdropiframe";
    c.id = "jdropiframe";
    document.body.appendChild(c);
    var d = document.createElement("form");
    d.method = "post";
    d.action = "http://jdrop.org/save";
    d.target = "jdropiframe";
    d.style.display = "hidden";
    for (var e in b) {
        var f = document.createElement("input");
        f.setAttribute("name", e);
        f.setAttribute("value", b[e]);
        d.appendChild(f)
    }
    document.body.appendChild(d);
    c.onload = function ()
    {
        document.body.removeChild(d);
        document.body.removeChild(c)
    };
    c.onerror = function ()
    {
        document.body.removeChild(d);
        document.body.removeChild(c)
    };
    d.submit()
};
cssess.v.createWin = function ()
{
    if (cssess.win) {
        cssess.win.remove()
    }
    cssess.$("#cssess").remove();
    cssess.win = cssess.$('<div id="cssess-overlay"/><div id="cssess"><h2>CSSess</h2><a class="cssess-close" title="close" href="">X</a><div class="cssess-body"><button class="cssess-toggle">Toggle</button><button class="cssess-jdrop">Save to Jdrop</button><ul class="cssess-links"/><ul class="cssess-styles"/></div><button class="cssess-run">find unused selectors</button></div>');
    cssess.$(".cssess-run", cssess.win).click(function ()
    {
        cssess.$(".cssess-styles", cssess.win).html("");
        cssess.loadLinks();
        cssess.spider();
        cssess.$(".cssess-jdrop").show()
    });
    cssess.$(".cssess-close", cssess.win).click(function ()
    {
        cssess.win.remove();
        return false
    });
    cssess.$(".cssess-toggle", cssess.win).click(function ()
    {
        cssess.$(":checkbox", cssess.win).each(function ()
        {
            this.checked ? this.checked = false : this.checked = "checked"
        })
    });
    cssess.$(".cssess-jdrop", cssess.win).click(function ()
    {
        var a = 0;
        for (i in cssess.data) {
            a += cssess.data[i].length
        }
        cssess.saveToJdrop(a + " unused CSS selectors")
    });
    cssess.win.appendTo("body")
};
cssess.v.addLink = function (a)
{
    if (cssess.$.inArray(a, cssess.links) == -1) {
        cssess.links.push(a);
        cssess.$(".cssess-links", cssess.win).append('<li><input type="checkbox" name="urls" value="' + a + '" checked/> ' + a + '</li>')
    }
};
cssess.v.addUnused = function (a, b)
{
    var c = {}, i;
    if (a && b) {
        c[a] = b
    } else {
        c = a
    }
    for (i in c) {
        a = i;
        b = c[i];
        var d = cssess.$(".cssess-styles", cssess.win), li = "<li><strong>" + a + " (" + b.length + " found)</strong><ul>", i;
        for (i in b) {
            li += "<li>" + b[i] + "</li>"
        }
        d.append(li + "</ul></li>")
    }
};
(function (d, t)
{
    var a, s, init = function ($)
    {
        cssess.v.createWin();
        if (!JDROPVIEW) {
            cssess.start()
        }
    };
    a = d.createElement("link");
    a.rel = "stylesheet";
    a.href = cssess.baseUrl + "cssess.css";
    s = d.getElementsByTagName(t)[0];
    s.parentNode.insertBefore(a, s);
    a = d.createElement(t);
    a.src = "//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js";
    a.onload = function ()
    {
        a.loaded = true;
        cssess.$ = jQuery.noConflict(true);
        init(cssess.$)
    };
    a.onreadystatechange = function ()
    {
        if ((a.readyState == "loaded" || a.readyState == "complete") && !a.loaded) {
            a.loaded = true;
            cssess.$ = jQuery.noConflict(true);
            init(cssess.$)
        }
    };
    s.parentNode.insertBefore(a, s)
})(document, "script");
