pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io/pranavmk'
    DOCKER_CRED = 'dockerhub-pranavmk'
    SONAR_CRED = 'sonar'
    SONAR_HOST = 'http://localhost:9000'
    BACKEND_BASE_URL = 'https://nexus-inventory-system-production.up.railway.app'
    RAILWAY_TOKEN = '94c309cc-5a6e-46f1-8644-b4b07fca314a'
    RAILWAY_PROJECT = 'nexus-inventory-system'
    RAILWAY_SERVICE = 'backend'
    RAILWAY_ENVIRONMENT = 'production'
    VERCEL_CRED = 'vercel-token'
    VERCEL_PROJECT_ID = 'prj_TE3hanu3sHZ2kHUzCp3T7tUfCyAb'
    VERCEL_ORG_ID = 'team_GpO5D543HdVwuCLjif4rqt4W'
    MONGO_URI = 'mongodb+srv://PranavMK:Pmk190705*@quickcommercedb.dejiyem.mongodb.net/quickCommerceDB?appName=quickCommerceDB'
  }
  stages {
    stage('Checkout') {
      steps {
        git branch: 'master', url: 'https://github.com/MK23IS092/nexus-inventory-system.git'
        script {
          env.IMAGE_TAG = bat(returnStdout: true, script: '''
          @echo off
          for /f %%i in ('git rev-parse --short HEAD') do echo %%i
          ''').trim()
          echo "Using image tag: ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Install & Test Backend') {
      steps {
        bat '''
        python -m pip install --upgrade pip
        pip install -r Backend/requirements.txt
        pip install pytest
        echo Using backend at %BACKEND_BASE_URL%
        python -m pytest -q Backend/test_api.py
        '''
      }
    }

    stage('Install & Test Frontend') {
      steps {
        bat '''
        cd frontend-react
        npm ci --legacy-peer-deps
        npm test -- --watchAll=false --passWithNoTests
        npm run build
        '''
      }
    }

    stage('OWASP Dependency Check') {
      steps {
        bat 'if not exist dependency-check-report mkdir dependency-check-report'
        dependencyCheck additionalArguments: '--scan ./ --format ALL --out dependency-check-report', odcInstallation: 'DP'
      }
      post {
        always {
          dependencyCheckPublisher pattern: 'dependency-check-report/dependency-check-report.xml'
          archiveArtifacts artifacts: 'dependency-check-report/**', allowEmptyArchive: true
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          withSonarQubeEnv('PranavMK') {
            script {
              def sonarScannerHome = tool name: 'Sonar-server', type: 'hudson.plugins.sonar.SonarRunnerInstallation'
              echo "Resolved Sonar scanner: ${sonarScannerHome}"
              echo "Sonar host URL: ${env.SONAR_HOST_URL}"

              if (!env.SONAR_AUTH_TOKEN || !env.SONAR_AUTH_TOKEN.trim()) {
                error('SONAR_AUTH_TOKEN was not injected by the SonarQube server configuration. Fix the SonarQube server entry named PranavMK in Jenkins.')
              }

              bat """
              "${sonarScannerHome}\\bin\\sonar-scanner.bat" ^
                -Dsonar.projectKey=nexus-inventory-system ^
                -Dsonar.projectName=nexus-inventory-system ^
                -Dsonar.host.url=%SONAR_HOST_URL% ^
                -Dsonar.token=%SONAR_AUTH_TOKEN% ^
                -Dsonar.sources=Backend,frontend-react/src ^
                -Dsonar.exclusions=**/node_modules/**,**/build/**,**/__pycache__/**,**/*.pyc
              """
            }
          }
        }
      }
    }

    stage('Prepare Docker Engine') {
      steps {
      writeFile file: 'start-docker.ps1', text: '''
  $ErrorActionPreference = "Stop"

  $desktopExe = Join-Path $env:ProgramFiles "Docker\\Docker\\Docker Desktop.exe"
  $services = @("com.docker.service", "Docker Desktop Service")

  foreach ($serviceName in $services) {
    $svc = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($svc -and $svc.Status -ne "Running") {
      try {
        Start-Service -Name $serviceName -ErrorAction Stop
        Write-Host "Started service: $serviceName"
      } catch {
        Write-Host "Unable to start service ${serviceName}: $($_.Exception.Message)"
      }
    }
  }

  if (Test-Path $desktopExe) {
    $desktop = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $desktop) {
      try {
        Start-Process -FilePath $desktopExe -ArgumentList "--minimized"
        Write-Host "Docker Desktop launched."
      } catch {
        Write-Host "Unable to start Docker Desktop: $($_.Exception.Message)"
      }
    } else {
      Write-Host "Docker Desktop already running."
    }
  } else {
    Write-Host "Docker Desktop not found at $desktopExe"
  }

  for ($i = 0; $i -lt 36; $i++) {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Docker daemon is available."
      exit 0
    }
    Write-Host "Waiting for Docker daemon... attempt $($i + 1)/36"
    Start-Sleep -Seconds 5
  }

  Write-Error "Docker daemon is not available after 3 minutes. Start Docker Desktop manually."
  exit 1
  '''
      bat 'powershell -NoProfile -ExecutionPolicy Bypass -File start-docker.ps1'
      }
    }

    stage('Build Docker Images') {
      steps {
        bat '''
        docker build -t docker.io/pranavmk/nexus-backend:%IMAGE_TAG% -t docker.io/pranavmk/nexus-backend:latest -f Dockerfile .
        docker build -t docker.io/pranavmk/nexus-frontend:%IMAGE_TAG% -t docker.io/pranavmk/nexus-frontend:latest -f frontend-react/Dockerfile frontend-react
        '''
      }
    }

    stage('Push Images') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          withCredentials([usernamePassword(credentialsId: env.DOCKER_CRED, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            bat '''
            echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
            docker push docker.io/pranavmk/nexus-backend:%IMAGE_TAG%
            docker push docker.io/pranavmk/nexus-backend:latest
            docker push docker.io/pranavmk/nexus-frontend:%IMAGE_TAG%
            docker push docker.io/pranavmk/nexus-frontend:latest
            '''
          }
        }
      }
    }

    stage('Deploy Frontend to Vercel') {
      steps {
        withCredentials([string(credentialsId: env.VERCEL_CRED, variable: 'VERCEL_TOKEN')]) {
          bat '''
          if not exist frontend-react\.vercel mkdir frontend-react\.vercel
          powershell -NoProfile -Command "$json = '{\"projectId\":\"%VERCEL_PROJECT_ID%\",\"orgId\":\"%VERCEL_ORG_ID%\"}'; Set-Content -Path frontend-react\.vercel\\project.json -Value $json -Encoding ASCII"
          npx --yes vercel deploy --cwd frontend-react --prod --yes --token %VERCEL_TOKEN%
          '''
        }
      }
    }

    stage('Deploy Backend to Railway') {
      steps {
        bat '''
        set RAILWAY_TOKEN=%RAILWAY_TOKEN%
        npx --yes @railway/cli whoami
        npx --yes @railway/cli up -p %RAILWAY_PROJECT% -e %RAILWAY_ENVIRONMENT% -s %RAILWAY_SERVICE% -d -c
        '''
      }
    }
  }
  post {
    always {
      cleanWs()
    }
  }
}
