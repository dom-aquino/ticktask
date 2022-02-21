home = new Vue({
  el: "#app",
  delimiters: ['[[', ']]'],
  mounted() {
    this.getCurrentUser();
    this.getTasks();
  },
  data: {
    user_id: null,
    task: null,
    tasks: []
  },
  methods: {
    getCurrentUser() {
      this.user_id = document.getElementById("user_id").innerText;
    },
    getTasks() {
      axios({
        method: 'get',
        url: '/api/users/' + this.user_id + '/tasks',
      })
      .then(response => {
        this.tasks = response.data['tasks']
      })
    },
    addTask() {
      if (this.task != null) {
        axios({
          method: 'post',
          url: '/api/tasks/add',
          data: {
            'task': this.task
          }
        })
        .then(response => {
          if (response.data['status'] == "success") {
            this.tasks.push({name: this.task, status: "New"});
            this.task = null;
          }
        })
      }
    },
    deleteTask(index) {
      axios({
        method: 'post',
        url: 'api/tasks/delete',
        data: {
          'task': this.tasks[index]
        }
      })
      .then(response => {
        if (response.data['status'] == "success") {
          this.tasks.splice(index, 1);
        }
      })
    },
    updateStatus(index, status) {
      var tempTask = this.tasks[index];
      tempTask['status'] = status;
      axios({
        method: 'put',
        url: 'api/tasks/update',
        data: {
          'task': tempTask
        }
      })
      .then(response => {
        if (response.data['status'] == "success") {
          this.tasks[index] = tempTask;
        }
      })
    },
  },
})

