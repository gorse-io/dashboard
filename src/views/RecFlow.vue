<template>
  <div class="main-content-container container-fluid px-4" id="drawflow">
  </div>
</template>

<script>
import Drawflow from 'drawflow';
import Vue from 'vue';

import Latest from 'raw-loader!../components/nodes/Latest.html';
import Popular from 'raw-loader!../components/nodes/Popular.html';
import NonPersonalized from 'raw-loader!../components/nodes/NonPersonalized.html';
import ItemToItem from 'raw-loader!../components/nodes/ItemToItem.html';
import UserToUser from 'raw-loader!../components/nodes/UserToUser.html';
import LLMRanker from 'raw-loader!../components/nodes/LLMRanker.html';
import CollaborativeFiltering from 'raw-loader!../components/nodes/CollaborativeFiltering.html';

export default {
  mounted() {
    var id = document.getElementById("drawflow");
    const editor = new Drawflow(id, Vue, this);
    editor.reroute = true;
    const dataToImport = {
      "drawflow": {
        "Home": {
          "data": {
            "5": {
              "id": 5,
              "name": "template",
              "data": {
                "template": "Write your template"
              },
              "class": "template",
              "html": LLMRanker,
              "typenode": false,
              "inputs": {
                "input_1": {
                  "connections": [
                    {
                      "node": "6",
                      "input": "output_1"
                    }
                  ]
                }
              },
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "4",
                      "output": "input_1"
                    },
                    {
                      "node": "11",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 607,
              "pos_y": 304
            },
            "6": {
              "id": 6,
              "name": "github",
              "data": {
                "name": "https://github.com/jerosoler/Drawflow"
              },
              "class": "github",
              "html": ItemToItem,
              "typenode": false,
              "inputs": {

              },
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "5",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 80,
              "pos_y": 290
            },
            "7": {
              "id": 7,
              "name": "latest",
              "data": {},
              "class": "latest",
              "html": Latest,
              "typenode": false,
              "inputs": {},
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "2",
                      "output": "input_1"
                    },
                    {
                      "node": "3",
                      "output": "input_1"
                    },
                    {
                      "node": "11",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 80,
              "pos_y": 40
            },
            "8": {
              "id": 8,
              "name": "popular",
              "data": {},
              "class": "popular",
              "html": Popular,
              "typenode": false,
              "inputs": {},
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "2",
                      "output": "input_1"
                    },
                    {
                      "node": "3",
                      "output": "input_1"
                    },
                    {
                      "node": "11",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 80,
              "pos_y": 120
            },
            "9": {
              "id": 9,
              "name": "popular",
              "data": {},
              "class": "popular",
              "html": UserToUser,
              "typenode": false,
              "inputs": {},
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "2",
                      "output": "input_1"
                    },
                    {
                      "node": "3",
                      "output": "input_1"
                    },
                    {
                      "node": "11",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 80,
              "pos_y": 580
            },
            "10": {
              "id": 10,
              "name": "popular",
              "data": {},
              "class": "popular",
              "html": CollaborativeFiltering,
              "typenode": false,
              "inputs": {},
              "outputs": {
                "output_1": {
                  "connections": [
                    {
                      "node": "2",
                      "output": "input_1"
                    },
                    {
                      "node": "3",
                      "output": "input_1"
                    },
                    {
                      "node": "11",
                      "output": "input_1"
                    }
                  ]
                }
              },
              "pos_x": 80,
              "pos_y": 810
            }
          }
        }
      }
    }
    editor.start();
    editor.import(dataToImport);

    /* DRAG EVENT */

    /* Mouse and Touch Actions */

    var elements = document.getElementsByClassName('drag-drawflow');
    for (var i = 0; i < elements.length; i++) {
      elements[i].addEventListener('touchend', drop, false);
      elements[i].addEventListener('touchmove', positionMobile, false);
      elements[i].addEventListener('touchstart', drag, false);
    }

    var mobile_item_selec = '';
    var mobile_last_move = null;
    function positionMobile(ev) {
      mobile_last_move = ev;
    }

    function allowDrop(ev) {
      ev.preventDefault();
    }

    function drag(ev) {
      if (ev.type === "touchstart") {
        mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
      } else {
        ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
      }
    }

    function drop(ev) {
      if (ev.type === "touchend") {
        var parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
        if (parentdrawflow != null) {
          addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
        }
        mobile_item_selec = '';
      } else {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("node");
        addNodeToDrawFlow(data, ev.clientX, ev.clientY);
      }

    }

    function addNodeToDrawFlow(name, pos_x, pos_y) {
      if (editor.editor_mode === 'fixed') {
        return false;
      }
      pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
      pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));


      switch (name) {
        case 'facebook':
          var facebook = `
        <div>
          <div class="title-box"><i class="fab fa-facebook"></i> Facebook Message</div>
        </div>
        `;
          editor.addNode('facebook', 0, 1, pos_x, pos_y, 'facebook', {}, facebook);
          break;
        case 'slack':
          var slackchat = `
          <div>
            <div class="title-box"><i class="fab fa-slack"></i> Slack chat message</div>
          </div>
          `
          editor.addNode('slack', 1, 0, pos_x, pos_y, 'slack', {}, slackchat);
          break;
        case 'github':
          var githubtemplate = `
          <div>
            <div class="title-box"><i class="fab fa-github "></i> Github Stars</div>
            <div class="box">
              <p>Enter repository url</p>
            <input type="text" df-name>
            </div>
          </div>
          `;
          editor.addNode('github', 0, 1, pos_x, pos_y, 'github', { "name": '' }, githubtemplate);
          break;
        case 'telegram':
          var telegrambot = `
          <div>
            <div class="title-box"><i class="fab fa-telegram-plane"></i> Telegram bot</div>
            <div class="box">
              <p>Send to telegram</p>
              <p>select channel</p>
              <select df-channel>
                <option value="channel_1">Channel 1</option>
                <option value="channel_2">Channel 2</option>
                <option value="channel_3">Channel 3</option>
                <option value="channel_4">Channel 4</option>
              </select>
            </div>
          </div>
          `;
          editor.addNode('telegram', 1, 0, pos_x, pos_y, 'telegram', { "channel": 'channel_3' }, telegrambot);
          break;
        case 'aws':
          var aws = `
          <div>
            <div class="title-box"><i class="fab fa-aws"></i> Aws Save </div>
            <div class="box">
              <p>Save in aws</p>
              <input type="text" df-db-dbname placeholder="DB name"><br><br>
              <input type="text" df-db-key placeholder="DB key">
              <p>Output Log</p>
            </div>
          </div>
          `;
          editor.addNode('aws', 1, 1, pos_x, pos_y, 'aws', { "db": { "dbname": '', "key": '' } }, aws);
          break;
        case 'log':
          var log = `
            <div>
              <div class="title-box"><i class="fas fa-file-signature"></i> Save log file </div>
            </div>
            `;
          editor.addNode('log', 1, 0, pos_x, pos_y, 'log', {}, log);
          break;
        case 'google':
          var google = `
            <div>
              <div class="title-box"><i class="fab fa-google-drive"></i> Google Drive save </div>
            </div>
            `;
          editor.addNode('google', 1, 0, pos_x, pos_y, 'google', {}, google);
          break;
        case 'email':
          var email = `
            <div>
              <div class="title-box"><i class="fas fa-at"></i> Send Email </div>
            </div>
            `;
          editor.addNode('email', 1, 0, pos_x, pos_y, 'email', {}, email);
          break;

        case 'template':
          var template = `
            <div>
              <div class="title-box"><i class="fas fa-code"></i> Template</div>
              <div class="box">
                Ger Vars
                <textarea df-template></textarea>
                Output template with vars
              </div>
            </div>
            `;
          editor.addNode('template', 1, 1, pos_x, pos_y, 'template', { "template": 'Write your template' }, template);
          break;
        case 'multiple':
          var multiple = `
            <div>
              <div class="box">
                Multiple!
              </div>
            </div>
            `;
          editor.addNode('multiple', 3, 4, pos_x, pos_y, 'multiple', {}, multiple);
          break;
        case 'personalized':
          var personalized = `
            <div>
              Personalized
            </div>
            `;
          editor.addNode('personalized', 1, 1, pos_x, pos_y, 'personalized', {}, personalized);
          break;
        case 'dbclick':
          var dbclick = `
            <div>
            <div class="title-box"><i class="fas fa-mouse"></i> Db Click</div>
              <div class="box dbclickbox" ondblclick="showpopup(event)">
                Db Click here
                <div class="modal" style="display:none">
                  <div class="modal-content">
                    <span class="close" onclick="closemodal(event)">&times;</span>
                    Change your variable {name} !
                    <input type="text" df-name>
                  </div>

                </div>
              </div>
            </div>
            `;
          editor.addNode('dbclick', 1, 1, pos_x, pos_y, 'dbclick', { name: '' }, dbclick);
          break;

        default:
      }
    }

    var transform = '';
    function showpopup(e) {
      e.target.closest(".drawflow-node").style.zIndex = "9999";
      e.target.children[0].style.display = "block";
      //document.getElementById("modalfix").style.display = "block";

      //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
      transform = editor.precanvas.style.transform;
      editor.precanvas.style.transform = '';
      editor.precanvas.style.left = editor.canvas_x + 'px';
      editor.precanvas.style.top = editor.canvas_y + 'px';
      console.log(transform);

      //e.target.children[0].style.top  =  -editor.canvas_y - editor.container.offsetTop +'px';
      //e.target.children[0].style.left  =  -editor.canvas_x  - editor.container.offsetLeft +'px';
      editor.editor_mode = "fixed";

    }

    function closemodal(e) {
      e.target.closest(".drawflow-node").style.zIndex = "2";
      e.target.parentElement.parentElement.style.display = "none";
      //document.getElementById("modalfix").style.display = "none";
      editor.precanvas.style.transform = transform;
      editor.precanvas.style.left = '0px';
      editor.precanvas.style.top = '0px';
      editor.editor_mode = "edit";
    }

    function changeModule(event) {
      var all = document.querySelectorAll(".menu ul li");
      for (var i = 0; i < all.length; i++) {
        all[i].classList.remove('selected');
      }
      event.target.classList.add('selected');
    }

    function changeMode(option) {

      //console.log(lock.id);
      if (option == 'lock') {
        lock.style.display = 'none';
        unlock.style.display = 'block';
      } else {
        lock.style.display = 'block';
        unlock.style.display = 'none';
      }

    }

  }
}
</script>

<style>
:root {
  --border-color: #cacaca;
  --background-color: #ffffff;
  --background-box-title: #f7f7f7;
}

.them-edit-link {
  position: absolute;
  top: 10px;
  right: 100px;
  color: black;
  font-size: 40px;
}

.them-edit-link a {
  text-decoration: none;
}

.github-link {
  position: absolute;
  top: 10px;
  right: 20px;
  color: black;
}

.wrapper {
  width: 100%;
  height: calc(100vh - 67px);
  display: flex;
}

.col {
  overflow: auto;
  width: 300px;
  height: 100%;
  border-right: 1px solid var(--border-color);
}

.drag-drawflow {
  line-height: 50px;
  border-bottom: 1px solid var(--border-color);
  padding-left: 20px;
  cursor: move;
  user-select: none;
}

.menu {
  position: absolute;
  height: 40px;
  display: block;
  background: white;
  width: 100%;
}

.menu ul {
  padding: 0px;
  margin: 0px;
  line-height: 40px;
}

.menu ul li {
  display: inline-block;
  margin-left: 10px;
  border-right: 1px solid var(--border-color);
  padding-right: 10px;
  line-height: 40px;
  cursor: pointer;
}

.menu ul li.selected {
  font-weight: bold;
}

.btn-export {
  float: right;
  position: absolute;
  top: 10px;
  right: 10px;
  color: white;
  font-weight: bold;
  border: 1px solid #0e5ba3;
  background: #4ea9ff;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 5;
}

.btn-clear {
  float: right;
  position: absolute;
  top: 10px;
  right: 85px;
  color: white;
  font-weight: bold;
  border: 1px solid #96015b;
  background: #e3195a;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 5;
}

.swal-wide {
  width: 80% !important;
}

.btn-lock {
  float: right;
  position: absolute;
  bottom: 10px;
  right: 140px;
  display: flex;
  font-size: 24px;
  color: white;
  padding: 5px 10px;
  background: #555555;
  border-radius: 4px;
  border-right: 1px solid var(--border-color);
  z-index: 5;
  cursor: pointer;
}

.bar-zoom {
  float: right;
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  font-size: 24px;
  color: white;
  padding: 5px 10px;
  background: #555555;
  border-radius: 4px;
  border-right: 1px solid var(--border-color);
  z-index: 5;
}

.bar-zoom svg {
  cursor: pointer;
  padding-left: 10px;
}

.bar-zoom svg:nth-child(1) {
  padding-left: 0px;
}

#drawflow {
  position: relative;
  width: calc(100vw - 301px);
  height: calc(100% - 50px);
  background: var(--background-color);
  background-size: 25px 25px;
  background-image:
    linear-gradient(to right, #f1f1f1 1px, transparent 1px),
    linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);
}

@media only screen and (max-width: 768px) {
  .col {
    width: 50px;
  }

  .col .drag-drawflow span {
    display: none;
  }

  #drawflow {
    width: calc(100vw - 51px);
  }
}



/* Editing Drawflow */

.drawflow .drawflow-node {
  background: var(--background-color);
  border: 1px solid var(--border-color);
  -webkit-box-shadow: 0 2px 15px 2px var(--border-color);
  box-shadow: 0 2px 15px 2px var(--border-color);
  padding: 0px;
  width: 250px;
}

.drawflow .drawflow-node.selected {
  background: white;
  border: 1px solid #4ea9ff;
  -webkit-box-shadow: 0 2px 20px 2px #4ea9ff;
  box-shadow: 0 2px 20px 2px #4ea9ff;
}

.drawflow .drawflow-node.selected .title-box {
  color: #22598c;
  /*border-bottom: 1px solid #4ea9ff;*/
}

.drawflow .connection .main-path {
  stroke: #4ea9ff;
  stroke-width: 3px;
}

.drawflow .drawflow-node .input,
.drawflow .drawflow-node .output {
  height: 15px;
  width: 15px;
  border: 2px solid var(--border-color);
}

.drawflow .drawflow-node .input:hover,
.drawflow .drawflow-node .output:hover {
  background: #4ea9ff;
}

.drawflow .drawflow-node .output {
  right: 10px;
}

.drawflow .drawflow-node .input {
  left: -10px;
  background: white;
}

.drawflow>.drawflow-delete {
  border: 2px solid #43b993;
  background: white;
  color: #43b993;
  -webkit-box-shadow: 0 2px 20px 2px #43b993;
  box-shadow: 0 2px 20px 2px #43b993;
}

.drawflow-delete {
  border: 2px solid #4ea9ff;
  background: white;
  color: #4ea9ff;
  -webkit-box-shadow: 0 2px 20px 2px #4ea9ff;
  box-shadow: 0 2px 20px 2px #4ea9ff;
}

.drawflow-node .title-box {
  height: 50px;
  line-height: 50px;
  background: var(--background-box-title);
  border-bottom: 1px solid #e9e9e9;
  border-radius: 4px 4px 0px 0px;
  padding-left: 10px;
}

.drawflow .title-box svg {
  position: initial;
}

.drawflow-node .box {
  padding: 10px 20px 20px 20px;
  font-size: 14px;
  color: #555555;

}

.drawflow-node .box p {
  margin-top: 5px;
  margin-bottom: 5px;
}

.drawflow-node.welcome {
  width: 250px;
}

.drawflow-node.slack .title-box {
  border-radius: 4px;
}

.drawflow-node input,
.drawflow-node select,
.drawflow-node textarea {
  border-radius: 4px;
  border: 1px solid var(--border-color);
  height: 30px;
  line-height: 30px;
  font-size: 16px;
  width: 200px;
  color: #555555;
}

.drawflow-node textarea {
  height: 100px;
}


.drawflow-node.personalized {
  background: red;
  height: 200px;
  text-align: center;
  color: white;
}

.drawflow-node.personalized .input {
  background: yellow;
}

.drawflow-node.personalized .output {
  background: green;
}

.drawflow-node.personalized.selected {
  background: blue;
}

.drawflow .connection .point {
  stroke: var(--border-color);
  stroke-width: 2;
  fill: white;

}

.drawflow .connection .point.selected,
.drawflow .connection .point:hover {
  fill: #4ea9ff;
}


/* Modal */
.modal {
  display: none;
  position: fixed;
  z-index: 7;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.7);

}

.modal-content {
  position: relative;
  background-color: #fefefe;
  margin: 15% auto;
  /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 400px;
  /* Could be more or less, depending on screen size */
}

/* The Close Button */
.modal .close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

@media only screen and (max-width: 768px) {
  .modal-content {
    width: 80%;
  }
}
</style>
