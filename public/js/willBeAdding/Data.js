
class Data {
    constructor() {
        this.container = document.getElementById('container')
        this._svgNS = "http://www.w3.org/2000/svg";
        this._canvasWidth = Math.floor(window.innerWidth) > 1366 ? 1366 : Math.floor(window.innerWidth)
        this._canvasHeight = Math.floor(window.innerHeight)
        this.clusterNames = {cluster0: 'Black', cluster1:'Blue', cluster2: 'Grey + Blue', cluster3: 'Cream', cluster4: 'White', cluster5: 'Pink', 
                              cluster6: 'Coral', cluster7: "Orange", cluster8: 'Brown + Orange', cluster9:'Grey + Brown', cluster10: 'Yellow', cluster11: 'Neon',
                              cluster12:'Grey + Brown', cluster13: 'Yellow', cluster14: 'Neon'}
        this._margin = {gap: _canvasWidth * _onGetRatio(20, _canvasWidth, null), top: _canvasHeight * _onGetRatio(30, null, _canvasHeight), 
                         right: _canvasWidth * _onGetRatio(60, _canvasWidth, null), bottom: _canvasHeight * _onGetRatio(50, null, _canvasHeight), 
                         left: _canvasWidth * _onGetRatio(140, _canvasWidth, null), columnWidth: _canvasWidth * _onGetRatio(170, _canvasWidth, null)};
        this._chart2 = {width: _canvasWidth - _margin.left, height: _canvasHeight * 0.2 * 0.8,
                         bigger_gap: _canvasHeight * _onGetRatio(22, null, _canvasHeight), big_gap: _canvasHeight * _onGetRatio(16, null, _canvasHeight),
                         sm_gap: _canvasHeight * _onGetRatio(12, null, _canvasHeight), smer_gap: _canvasHeight * _onGetRatio(10, null, _canvasHeight),
                         smst_gap: _canvasHeight * _onGetRatio(8, null, _canvasHeight)}
        this._color = {mapLine: "#CCCCCC", mapBG: "#F5F5F5", cluster: "#efc100", premiumPrice: "#F65E5D", resaleVolume: "#0382ed", msrp: "#808080", chartBG: "#FDFDFD", text: "#333333", greyText: '#999999'}
        this._colorXScale = _canvasWidth - (_margin.left * 2) - _margin.right;
        this._colorYScale = _canvasHeight - _chart2.height - _margin.left; 
    }
     
}
