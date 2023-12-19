pipeline {
   agent any
   environment {
       tag = VersionNumber(versionNumberString: 'v${BUILD_DATE_FORMATTED, "yyMMdd"}${BUILDS_TODAY}')
       slackToken = "${SLACK_TOKEN}"
       // Global variable from jenkins
       imageRegistryHost = "${IMAGE_REGISTRY_HOST}"
       imageRegistry = "${IMAGE_REGISTRY}"
       jenkinsEnv = "${JENKINS_ENV}"
       branchName = "${GIT_BRANCH.split("/")[1]}"
       namespace = "kutt-it"
       registry = "middleware/kutt-it"
       envFile = "/var/lib/jenkins/config/icarus/be/${branchName}.env"
   }
   stages {
       stage('Build') {
           environment {
               registryCredential = 'tbsi-jfrog'
           }
           steps{
               script {
                   sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"⛏ Building image ${registry}:${tag}\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n♨ Repo: ${GIT_URL}\n🌿 Branch: ${branchName}\n💬 Commit: ${GIT_COMMIT}\"}'"
                   def appimage = docker.build registry + ":" + tag
                   sh "rm -Rf .env"
                   docker.withRegistry( imageRegistry, registryCredential ) {
                       sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"📌 Pushing image ${registry}:${tag}\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n♨ Repo: ${GIT_URL}\n🌿 Branch: ${branchName}\n💬 Commit: ${GIT_COMMIT}\"}'"
                       appimage.push()
                       appimage.push('latest')
                   }
               }
           }
       }
       stage ('Deploy') {
           steps {
               script{
                   sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"🚀 Deployed image ${registry}:${tag} to Kubernetes Cluster (${K8S_CLUSTER})\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n♨ Repo: ${GIT_URL}\n🌿 Branch: ${branchName}\n💬 Commit: ${GIT_COMMIT}\"}'"
                   def image_id = registry + ":" + tag
                   sh "ansible-playbook playbook.yml --extra-vars \"image_id=${image_id} image_registry=${imageRegistryHost} namespace=${namespace}\""
               }
           }
       }
   }
 
   post {
        failure {
            sh "curl -s -X POST https://hooks.slack.com/services/" + slackToken + " -H 'Content-Type: application/json' -d '{\"text\": \"❌ Pipeline for image ${registry}:${tag} has failed, please check Jenkins UI for complete pipeline log\n\n🌍 ENV: ${jenkinsEnv}\n📛 NS: ${namespace}\n🌿 Branch: ${branchName}\n♨ Repo: ${GIT_URL}\"}'"   
        }
    }
}
