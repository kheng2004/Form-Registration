

// Đối tượng Validator
function Validator(options){
    // Hàm thực hiện validate
    var selectorRules = {};
    function getParent(element, selector)
    {
        while(element.parentElement)
        {
            if(element.parentElement.matches(selector))
                return element.parentElement;
            element = element.parentElement;
        }
    }
    // Hàm thực hiện validate
    function validate(inputElement, rule)
    {
        
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage = rule.test(inputElement.value);

        // Lấy ra các quy tắc của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng quy tắc và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; ++i)
        {
            switch(inputElement.type)
            {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    
            }
            
            if(errorMessage) break;
        }
        if(errorMessage)
        {
            
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }
        else
        {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
            return !errorMessage;

    }}
    // Lấy ra form element trong DOM theo options.form
    var formElement = document.querySelector(options.form);
    if(formElement)
    {
        // Khi submit form
        formElement.onsubmit = function(e)
        {
            e.preventDefault();
            var isFormValid = true;
            // Thực hiện lặp qua từng rules và validate
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector);
                
                var isValid = validate(inputElement, rule);
                if(!isValid)
                {
                    isFormValid = false;
                }
            })
            

            if (isFormValid)
            {
                // Trường hợp submit với JS
                if(typeof options.onSubmit === 'function')
                {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValue = Array.from(enableInputs).reduce(function(values, input)
                    {
                        switch(input.type)
                        {
                            case 'checkbox':
                                if(!input.matches(':checked'))
                                {
                                    
                                    return values;
                                }
                                if(!Array.isArray(values[input.name]) )
                                {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                                
                            case 'radio':
                                var checkedRadio = formElement.querySelector('input[name="' + input.name + '"]:checked');
                                if (checkedRadio) {
                                    values[input.name] = checkedRadio.value;
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {})
                    options.onSubmit(formValue);
                }
                // Trường hợp submit với hành vi mặc định
                else
                {
                    formElement.submit();
                }
            }
            
                

        }
        options.rules.forEach(function(rule)
        {
            // Lưu lại các quy tắc cho mỗi input
            if(Array.isArray(selectorRules[rule.selector]))
            {
                selectorRules[rule.selector].push(rule.test);
            }
            else
            {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElement = formElement.querySelectorAll(rule.selector);
            Array.from(inputElement).forEach(function(inputElement)
            {
                // Xử lý trường hợp blur ra ngoài input
                inputElement.onblur = function()
                {
                    validate(inputElement, rule);
                }
                // Xử lý trường hợp người dùng nhập vào input
                inputElement.oninput = function()
                {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    
                }
            })
        });
        

}}

// Định nghĩa các quy tắc
// Nguyên tắc:
// 1. Khi có lỗi thì trả ra message lỗi
// 2. Khi hợp lệ thì trả ra undefined

Validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined:message || 'Vui lòng nhập trường này';
           
        }
    };
}

Validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(value)    ? undefined : message || 'Trường này phải là email';
            
        }
    };
}
Validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
            
        }
    };
}
Validator.isConfirmed = function(selector, getConfirmValue, message )
{
    return {
        selector: selector,
        test: function(value)
        {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}