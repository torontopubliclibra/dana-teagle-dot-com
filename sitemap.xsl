<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
        version="2.0"
        xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
        xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

    <xsl:output method="html" indent="yes" encoding="UTF-8"/>

    <xsl:template match="/">
        <html class="sitemap">
            <head>
                <title>
                    dana teagle dot com | sitemap
                    <xsl:if test="sitemap:sitemapindex">Index</xsl:if>
                </title>
                <link rel="stylesheet" href="./styles/styles.css"/>
                <!-- <link rel="stylesheet" href="https://unpkg.com/tachyons@4.6.1/css/tachyons.min.css"/> -->
            </head>
            <body>
                <header>
                    <h1>dana teagle dot com sitemap</h1>
                    <hr style="max-width: 1400px"/>
                    <p style="max-width: 1200px; margin: 0 auto;">
                        This is an XML sitemap for <a href="https://danateagle.com" target="_blank">danateagle.com</a>, meant for consumption by search engines. You can find more info about XML sitemaps on <a href="https://sitemaps.org" target="_blank">sitemaps.org</a>.
                    </p>
                </header>

                <xsl:apply-templates/>

            </body>
        </html>
    </xsl:template>

    <xsl:template match="sitemap:urlset">
        <main>
            <table cellspacing="0" style="max-width: 1200px">
                <thead>
                    <tr>
                        <th></th>
                        <th>Page URL</th>
                        <xsl:if test="sitemap:url/sitemap:lastmod">
                        <th>Last Modified</th>
                        </xsl:if>
                    </tr>
                </thead>
                <tbody>
                <xsl:for-each select="sitemap:url">
                    <tr>
                        <xsl:variable name="loc">
                            <xsl:value-of select="sitemap:loc"/>
                        </xsl:variable>
                        <xsl:variable name="pno">
                            <xsl:value-of select="position()"/>
                        </xsl:variable>
                        <td>
                            <xsl:value-of select="$pno"/>
                        </td>
                        <td>
                            <p>
                                <a href="{$loc}" target="_blank">
                                    <xsl:value-of select="sitemap:loc"/>
                                </a>
                            </p>
                            <xsl:apply-templates select="xhtml:*"/>
                            <xsl:apply-templates select="image:*"/>
                            <xsl:apply-templates select="video:*"/>
                        </td>
                        <xsl:if test="sitemap:lastmod">
                        <td>
                            <xsl:value-of select="concat(substring(sitemap:lastmod, 0, 11), concat(' ', substring(sitemap:lastmod, 12, 5)), concat(' ', substring(sitemap:lastmod, 20, 6)))"/>
                        </td>
                        </xsl:if>
                    </tr>
                </xsl:for-each>
                </tbody>
            </table>
        </main>
    </xsl:template>

    <xsl:template match="sitemap:loc|sitemap:lastmod|image:loc|image:caption|video:*">
    </xsl:template>

</xsl:stylesheet>