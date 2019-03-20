// 현재 화면보다 많은 정보를 출력할 때 Scroll 기능을 구현하도록 합니다.
// handsontable CE 에서도 지원합니다
// 모든 데이터를 보여주기 불편한 문제가 있습니다.
const NEW_PAGE_ID = 0;

// Handsontable 활용하기
// http://qiita.com/opengl-8080/items/ac19deec388c357cd498
// http://qiita.com/opengl-8080/items/9d25e106ff48b66cb908
var data  = [];
var grid  = document.getElementById('grid');

var table = new Handsontable(grid, {
    data: data,
    // 데이터 바인딩 할 때 dataSchema 설정이 필요하지만、
    // columns로 지정하면 dataSchema 설정이 필요합니다
    // http://qiita.com/kivatek/items/c839bdb09e75537b15f8
    // dataSchema: {
    //     purchase_date: null,
    //     name: null,
    //     price: null,
    // },

    columns: [
        { data: 'purchase_date', type: 'text' },
        { data: 'name', type: 'text' },
        { data: 'price', type: 'numeric' },
    ],    
    // 열의 Header 값을 정의합니다
    colHeaders: ["일자", "도시명", "가격"],
    // 행 헤더를 표시합니다 (1,2,3....)
    rowHeaders: true,
    // 열의 너비
    colWidths: [120, 200, 100],

    // Handsontable Pro 에서 다음의 내용이 추가됩니다
    // 때문에 Handsontable CE 에서 지원하지 않는 부분도 존재합니다
    // 기능적으로 내부에 적용하는 DropDown 메뉴들은 CE에선 일부 지원되지 않습니다
    // stretchH: 'all',
    // width: 806,
    // height: 487,
    // autoWrapRow: true,
    // maxRows: 3,
    // manualRowResize: true,
    // manualColumnResize: true,
    // rowHeaders: true,
    // manualRowMove: true,
    // manualColumnMove: true,
    // contextMenu: true,
    // filters: true,
    // dropdownMenu: true
});

// 함수에서 해당작업을 직접 실행합니다
// http://analogic.jp/arrow-function/#immediate-function
var id = (() => {
    // https://syncer.jp/javascript-reference/location
    var found = location.pathname.match(/\/myapp\/records\/(.*?)\/edit$/);
    // 새로운 테이블은 편의상 id = 0으로 간주하고 처리합니다
    return found ? found[1] : NEW_PAGE_ID;
})(); // () 가 있어야 오류를 출력하지 않습니다 9참..)

// -----------------------------------
// Handsontable의 hooks 설정하기
// -----------------------------------
// 행 추가
Handsontable.hooks.add('onAddRow', mydata => {
    table.alter('insert_row', data.length);
});

// 저장시 처리
Handsontable.hooks.add('onSave', mydata => {
    // CSRF 보안을 활용하여 Cookie 정보를 호출합니다
    // https://docs.djangoproject.com/en/1.10/ref/csrf/#ajax
    var csrftoken = Cookies.get('csrftoken');    
        // Django 미들웨어 django.middleware.csrf.CsrfViewMiddleware 를 활용합니다
        // POST 로 정보전달시 mode와 credentials 에 X-CSRFToken 헤더가 포함됩니다
        fetch(`/myapp/ajax/records/${id}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            mode: 'same-origin',
            credentials: 'same-origin',
            body: JSON.stringify(mydata),
        }).then(response => {
            console.log(response.url, response.type, response.status);
            if (response.status == '200'){
                window.alert('저장완료');
                // 목록을 redirection 합니다
                location.href = '/myapp/records';
            }
            else{
                // 오류가 발생한 경우 출력메세지를 정의합니다
                window.alert('날짜는 YYYY-MM-DD, 가격에 숫자만 입력하세요');
            }
        }).catch(err => console.error(err));
    });

// -----------------------------------
// 이벤트 리스너를 추가합니다
// -----------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // load 기능을 실행시, Handsontable의 초기 값을 취득/표시합니다
    fetch(`/myapp/ajax/records/${id}`, {
        method: 'GET',
        }).then(response => {
            console.log(response.url, response.type, response.status);
            response.json().then(json => {
                for (var i = 0; i < json.length; i++){
                    data.push({
                        purchase_date: json[i].purchase_date,
                        name: json[i].name,
                        price: json[i].price,
                    });
                }
                table.render();
            });
        }).catch(err => console.error(err));
    }, false);

// 저장버튼을 누르면 Handsontable 에서 hook 합니다
document.getElementById('save').addEventListener('click', () => {
    Handsontable.hooks.run(table, 'onSave', data);
});

// 행 추가 버튼을 누르면 Handsontable 에서 hook 합니다
document.getElementById('add').addEventListener('click', () => {
    Handsontable.hooks.run(table, 'onAddRow', data);
});


// hotElement 내용은 grid 와 동일 
// hotSettings 내용은 table 과 동일
// var hot = new Handsontable(hotElement, hotSettings);
// var hot = new Handsontable(grid, table);