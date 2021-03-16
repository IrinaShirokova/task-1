function TodoList() {
    var tasks = new Map();
    var current_id = 0;
    var addTask = function (task) {
        task.id = current_id
        tasks.set(current_id, task);
        current_id += 1;
        return task;
    }
    // JSON object
    addTask({ description: 'create todo list', completed: false});
    addTask({ description: 'add filtering by priority', completed: false});
    addTask({ description: 'use rest api backend', completed: false});

    return {
        change_complete_task: function (task_id, completed) {
            task = tasks.get(parseInt(task_id));
            task.completed = completed;
        },
        edit_task: function(task_id, description) {
            task = tasks.get(parseInt(task_id));
            task.description = description;
        },
        get_task: function (task_id) {
            return tasks.get(task_id);
        },
        add_task: function (task) {
            addTask(task);
        },
        remove_task: function (task_id) {
            return tasks.delete(parseInt(task_id));
        },
        all_tasks: function () {
            return tasks.values();
        },
        print_all: function () {
            for (var v of tasks) {
                console.log(v);
            }
        }
    }
}
var todoList = new TodoList();

function add() {
    var $input_task = $('#task');
    var description = $input_task.val();

    if (description.trim() === '') return false;

    todoList.add_task({'description': description, 'completed': false});
    showTaskList();
    $input_task.val('');
    return true;
}

function changeLabel() {
    var id = this.getAttribute('id');
    var $label = $('label[id="' + id + '"]');
    var $input = $('.edit-input[id="' + id + '"]');

    $label.hide();
    $input.show().focus();

    //вот без этого была ошибка. При тыке на label - теперь передаваем в input старое зачение для редактирования, без этого было пусто.
    $input.val($label.text());
    return false;
}

function labelChanged() {
    var id = this.getAttribute('id'),
        description = $('.edit-input[id=' + id + ']').val();

    todoList.edit_task(id, description);
    showTaskList();
    return false;
}

function changeStatus() {
    var task_id = this.getAttribute('id');
    var task = todoList.get_task(parseInt(task_id));
    todoList.change_complete_task(task_id, !task.completed)
    showTaskList();
}

function isTaskCompleted(task_id) {
    var task = todoList.get_task(task_id);
    return task.completed;
}

function checkedProperty(task_id) {
    if (isTaskCompleted(task_id)) {
        return "checked=\"true\"";
    } else {
        return "";
    }
}

function remove() {
    var id = this.getAttribute('id');

    todoList.remove_task(id);
    showTaskList();
    return false;
}

var taskList = function() {
    var html = '';
    for (var todo of todoList.all_tasks()) {
        var checked = checkedProperty(todo.id);
        html += '<div class="input-group style"><span class="input-group"><input type="checkbox" id="' + todo.id + '" ' + checked + '><label for="checkbox" id="' + todo.id + '" class="edit">' + todo.description + '</label><input class="edit-input" id="' + todo.id + '"/></span><span class="input-group-btn"><button aria-label="Close" class="close remove" id="' + todo.id + '"><span aria-hidden="true">&times;</span></button></span></div>';
    }

    document.getElementById('todos').innerHTML = html;

    var buttons = document.getElementsByClassName('remove'),
        edit = document.getElementsByClassName('edit'),
        edit_inputs = document.getElementsByClassName('edit-input'),
        checkboxes = $("input[type=checkbox]");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', remove);
    };

    for (var i = 0; i < edit.length; i++) {
        edit[i].addEventListener('dblclick', changeLabel);
        edit[i].addEventListener('touchmove', changeLabel);
    };

    for (var i = 0; i < edit_inputs.length; i++) {
        edit_inputs[i].addEventListener('focusout', labelChanged);
    };

    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('click', changeStatus);
    };
}

function calculateCounter() {
    var $counter = $('#counter'),
        $inputs = $("input[type=checkbox]"),
        $inputsCh = $inputs.filter(':checked'),
        tempArray = [$inputsCh.length, $inputs.length],
        informationText = tempArray[0]-tempArray[1];
    $counter.html(informationText);
}

var activeFilter = "all";

//из трех - один метод и передаю тип в листенере
function filterTasks(filter) {
    activeFilter = filter;
    var $inputs = $("div input[type=checkbox]"),
        $inputsCh = $inputs.filter(":checked").parent().parent(),
        $inputsNotCh = $inputs.filter(":not(:checked)").parent().parent();
    $('#filterGroup>p').removeClass("active");
    switch(activeFilter) {
        case 'active':
            $('#activeFilter').addClass("active");
            return ($inputsCh.hide(), $inputsNotCh.show());
        case 'completed':
            $('#completedFilter').addClass("active");
            return ($inputsNotCh.hide(), $inputsCh.show());
        default:
            $('#allFilter').addClass("active");
            return $inputs.parent().parent().show();
    }
    //showTaskList() - в конце не нужен уже был. и не достижимый кусок
}

document.querySelector("#allFilter").addEventListener('click', function () {filterTasks('all')}, false);
document.querySelector("#activeFilter").addEventListener('click', function () {filterTasks('active')}, false);
document.querySelector("#completedFilter").addEventListener('click', function () {filterTasks('completed')}, false);

function showTaskList() {
    taskList();
    filterTasks(activeFilter);
    calculateCounter();
}

document.getElementById('add').addEventListener('click', add);
showTaskList();

//из двух - один метод Выделить все/снять выделение
function selectChange(checked) {
    var inputs = $("input[type=checkbox]");

    for (var i = 0; i < inputs.length; i++ ) {
        inputs[i].checked=true;
        todoList.change_complete_task(inputs[i].id, checked);
    }
    showTaskList();
}
document.querySelector("#selectAll").addEventListener('click', function (){selectChange(true)}, false);
document.querySelector("#deselectAll").addEventListener('click', function (){selectChange(false)}, false);

function completedRemove() {
    var inputs = $("input[type=checkbox]");

    for (var i = 0; i < inputs.length; i++ ) {
        if (inputs[i].checked == true) {
            todoList.remove_task(inputs[i].id)
        }
    showTaskList();
    }
}
document.querySelector("#completedRemove").addEventListener('click', completedRemove, false);

//вот без этого была ошибка. Не нужно отправлять ничего на сервер и перегружать форму.
function handleSubmit(event) {event.preventDefault();}
document.querySelector("#main").addEventListener('submit', handleSubmit, false);
