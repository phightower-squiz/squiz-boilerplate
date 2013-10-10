Contributed By: jsinclair@squiz.com.au

Note: This plugin uses an .svg image which will not render correctly in Matrix without this bug fix (http://bugs.matrix.squiz.net/view_bug.php?bug_id=6353). Matrix won't serve out .svg files with the correct headers.

If you are still having trouble and are using live file assets, check in apache. It's possible that the svg files are being served as XML, not SVG.