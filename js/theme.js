/* theme.js */

/**
 * setTheme(theme)
 * 
 * Changes the current theme by removing existing theme classes
 * and adding the new theme class ('light-theme', 'dark-theme', or 'colorful-theme').
 */
function setTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme', 'colorful-theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'colorful') {
        document.body.classList.add('colorful-theme');
    } else {
        document.body.classList.add('light-theme');
    }
}
