// Đối tượng 'validator'
function Validator(option) {
  var selectorRules = {};

  // Hàm thực hiện Validate
  function validate(inputElement, rule) {
    var errorElement =
      inputElement.parentElement.querySelector(".form-message");
    var errorMessage;
    // Lấy ra các Rules của selector
    var rules = selectorRules[rule.selector];

    // Lặp qua từng Rules và kiểm tra
    // Nếu có lỗi dừng việt kiểm tra
    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  }
  // Lấy Element của form
  var formElement = document.querySelector(option.form);

  if (formElement) {
    // Khi Submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      // Lặp qua từng Rule và Validate
      option.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Truong hop submit với JS
        if (typeof option.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            return (values[input.name] = input.value) && values;
          },
          {});

          option.onSubmit(formValues);
        }
        // Trường hợp submit với hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };

    // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện)
    option.rules.forEach(function (rule) {
      // Lưu lại các Rule cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);

      if (inputElement) {
        // xử lý trường hợp blur ra ngoài
        inputElement.onblur = function () {
          // value : inputElement.value
          // test func: rule.test
          validate(inputElement, rule);
        };
        // Xử lý mỗi khi người dùng nhập vào input
        inputElement.oninput = function () {
          var errorElement = inputElement.parentElement.querySelector(
            option.errorSelector
          );
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
    });
  }
}

// Định nghĩa Rules
// Nguyên tắc của các rule:
// 1. Khi có lỗi thì trả ra mesage lỗi
// 2. Khi hợp lệ thì không trả ra gì cả
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Please enter this field";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "This field must be email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Please enter at least ${min} characters`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Incorrect value";
    },
  };
};
