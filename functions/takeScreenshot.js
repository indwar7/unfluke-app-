import html2canvas from 'html2canvas';

const takeScreenshot = (component) => {

    html2canvas(component).then((canvas) => {

        const image = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.download = 'screenshot.png';
        link.href = image;
        
        link.click();
    });

};

export default takeScreenshot