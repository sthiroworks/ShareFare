$(document).ready(function () {
  $.each($("input"), function (index, element) {
    $(element).css({ color: "navy" });
  });
  $("form table tr td input").each(function (idx, ele) {
    // no-op
  });
  $('.inputClass増減A[name*="btn"][type*="button"][value=100]').each(
    function (idx, ele) {
      // no-op
    }
  );
  $('input.ex1[name*="address"]').each(function (a, b) {
    // no-op
  });
  $("#id1").click(function () {
    増減("InputNum走行距離", "+", "100");
  });
  $.each([100], function () {
    console.log($(this));
    $("td.tdClass増減A input[value=" + $(this) + "]").each(function () {
      console.log($(this));
    });
  });
});

function AllCalc() {
  ガソリン代Calc();
  ガソリン代以外Calc();
  合計Calc();
  一人当たりCalc();
}

function ガソリン代Calc() {
  let 走行距離 = ChkRet($("#InputNum走行距離")[0].value, 0);
  let 燃費 = ChkRet($("#InputNum燃費")[0].value, 1);
  let ガソリン単価 = ChkRet($("#InputNumガソリン単価")[0].value, 0);

  let ガソリン代 = Math.round((走行距離 / 燃費) * ガソリン単価);

  $("#InputNumガソリン代")[0].value = ガソリン代;
}

function ガソリン代以外Calc() {
  let 高速代 = ChkRet($("#InputNum高速代")[0].value, 0);
  let 駐車場代 = ChkRet($("#InputNum駐車場代")[0].value, 1);
  let その他 = ChkRet($("#InputNumその他")[0].value, 0);

  let ガソリン代 = 高速代 + 駐車場代 + その他;

  $("#InputNumガソリン代以外")[0].value = ガソリン代;
}

function 合計Calc() {
  let ガソリン代 = ChkRet($("#InputNumガソリン代")[0].value, 0);
  let ガソリン代以外 = ChkRet($("#InputNumガソリン代以外")[0].value, 0);

  $("#InputNum合計")[0].value = ガソリン代 + ガソリン代以外;
}

function 一人当たりCalc() {
  let 合計 = ChkRet($("#InputNum合計")[0].value, 0);
  let 人数 = ChkRet($("#InputNum人数")[0].value, 1);

  $("#InputNum一人当たり")[0].value = Math.round(合計 / 人数);
}

function ChkRet(Val, RetVal) {
  let Ret;

  if (Val != "") {
    Ret = parseFloat(eval(Val));
  } else {
    Ret = parseFloat(RetVal);
  }
  return Ret;
}

function InputSample() {
  $("#InputNum走行距離")[0].value = "500";
  $("#InputNum燃費")[0].value = "11.5";
  $("#InputNumガソリン単価")[0].value = "129";
  $("#InputNum駐車場代")[0].value = "1000";
  $("#InputNum高速代")[0].value = "7000";
  $("#InputNumその他")[0].value = "100";
  $("#InputNum人数")[0].value = "4";

  AllCalc();
}

function 全Clear() {
  $("#InputNum走行距離")[0].value = "0";
  $("#InputNum燃費")[0].value = "0.1";
  $("#InputNumガソリン単価")[0].value = "0";
  $("#InputNumガソリン代")[0].value = "0";
  $("#InputNum駐車場代")[0].value = "0";
  $("#InputNum高速代")[0].value = "0";
  $("#InputNumその他")[0].value = "0";
  $("#InputNumガソリン代以外")[0].value = "0";
  $("#InputNum人数")[0].value = "1";
  $("#InputNum合計")[0].value = "0";
  $("#InputNum一人当たり")[0].value = "0";
}

function 増減(Id, PM, Num) {
  let $Id = $("#" + Id)[0];

  if ($Id.value != "") {
    if (PM == "+") {
      $Id.value = parseFloat($Id.value) + parseFloat(Num);
    } else if (PM == "-") {
      $Id.value = parseFloat($Id.value) - parseFloat(Num);
    } else {
      // DoNothing
    }

    if (parseFloat($Id.value) < 0.1) {
      $Id.value = 種別RetNum(Id);
    }
    $Id.value = Math.round($Id.value * 10) / 10;
  } else {
    $Id.value = 種別RetNum(Id);
    console.log($Id);
  }
  AllCalc();
}

function 種別RetNum(id) {
  let Ret = 0;
  switch (id) {
    case "InputNum燃費":
      Ret = 0.1;
      break;
    case "InputNum人数":
      Ret = 1;
      break;
    default:
      Ret = 0;
      break;
  }
  return Ret;
}
