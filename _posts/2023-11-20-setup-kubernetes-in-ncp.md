---
layout: single
title: "[DevOps] Kubernetes(k8s) 서비스 세팅하기 (with.네이버클라우드플랫폼)"
categories: devops
tag: [devops, ncp, naver cloud platform, kubernetes, ncp k8s, nks]
toc: true
---

## 1. 배경
오늘은 네이버 클라우드 플랫폼 에서 서비스 하고 있는 

쿠버네티스(kubernetes) 서비스 세팅 방법에 대하여 포스팅 하겠습니다.

### 1.1 용어
쿠버네티스(kubernetes)는 줄여서 k8s 라고 부르기도 합니다. 

네이버클라우드플랫폼 역시 줄여서 ncp 라고 부르기도 합니다.

참고로 구글은 gcp 라고 부르기도 하고, 

구글에서 서비스하는 쿠버네티스 서비스는 gke, 

네이버는 nks 라고도 부르기도 합니다.

### 1.2 쿠버네티스
요즈음 많은 기업들이 마이크로서비스 아키텍처로 서비스를 구현함에 따라 쿠버네티스의 

사용은 아주 많이 증가 되어있으며, 그에따라 쿠버네티스를 직접 구축하거나,

클라우드 회사의 쿠버네티스 서비스를 이용 하는 경우가 많아 졌습니다.

직접 구축하는 경우는 구현 난이도가 엄청나게 올라가게 되고 각종 네트워크 설정,

로드밸런서 설정등 신경쓸게 매우 많아 지기 때문에 작은 규모의 사업장에서는 구현하기 힘든방식입니다.

그래서 선택할 수 있는 방법은 클라우드 플랫폼 회사의 쿠버네티스 서비스를 활용하는 방법입니다.

## 2. 쿠버네티스 서비스 설치
네이버클라우드플랫폼(ncp) 에서 서비스하는 쿠버네티스 서비스는 두가지가 있는데

vpc(Virtual Private Cloud) 와 classic 입니다. 

vpc가 조금더 비싸긴 하지만 적용할 수 있는 기능이 많고 보안에 좋기 때문에

vpc 버전을 설치 하겠습니다.

![vpc](/images/2023-11-20-setup-kubernetes-in-ncp/vpc.png)

위에 사진에서 플랫폼이 VPC로 체크되어 있는지 확인해주세요.

### 2.1 VPC 생성
우리는 VPC로 생성하기로 했으니 vpc 생성을 먼저 해줍니다.

![vpc-create1](/images/2023-11-20-setup-kubernetes-in-ncp/vpc-create1.png)

위 화면에서 생성을 누르면

![vpc-create2](/images/2023-11-20-setup-kubernetes-in-ncp/vpc-create2.JPG)

설명에도 나와있지만 쓸수 있는 사설망 대역은 세가지 입니다. 

세가지중에 선택해서 사용하시면됩니다.

### 2.2 Network ACL 설정
vpc 사설망에 접속하기 위한 네트워크 규칙을 설정해 줍니다.

![network-acl1](/images/2023-11-20-setup-kubernetes-in-ncp/network-acl1.png)

생성후 규칙을 설정합니다.

![network-acl2](/images/2023-11-20-setup-kubernetes-in-ncp/network-acl2.png)

22 번 포트에 대해서 인바운드 규칙을 정해줍니다.

### 2.3 Subnet 설정
vpc에서 생성한 가상 사설망에대한 서브넷을 설정해 줍니다.

로드밸런서, 일반, 쿠베네티스 세가지로 설정을 해줍니다.

![subnet1](/images/2023-11-20-setup-kubernetes-in-ncp/subnet1.JPG)

![subnet2](/images/2023-11-20-setup-kubernetes-in-ncp/subnet2.JPG)

![subnet3](/images/2023-11-20-setup-kubernetes-in-ncp/subnet3.JPG)

### 2.4 NAT Gateway 설정
NAT Gateway 설정을 해줍니다.

![nat-gateway](/images/2023-11-20-setup-kubernetes-in-ncp/nat-gateway.JPG)

### 2.5 Route Table 설정
라우트 테이블 설정을 해줍니다.

![route-table1](/images/2023-11-20-setup-kubernetes-in-ncp/route-table1.JPG)

![route-table2](/images/2023-11-20-setup-kubernetes-in-ncp/route-table2.JPG)

![route-table3](/images/2023-11-20-setup-kubernetes-in-ncp/route-table3.JPG)

### 2.6 Kubertenes Service 세팅
이제 기본적인 설정은 모두다 끝났습니다.

이제 쿠버네티스 서비스 설정을 하면 됩니다.

![k8s1](/images/2023-11-20-setup-kubernetes-in-ncp/k8s1.JPG)

최초 약관에 동의해 줍니다.

![k8s2](/images/2023-11-20-setup-kubernetes-in-ncp/k8s2.JPG)

그다음으로는 노드풀을 설정해주고,

![k8s3](/images/2023-11-20-setup-kubernetes-in-ncp/k8s3.JPG)

![k8s4](/images/2023-11-20-setup-kubernetes-in-ncp/k8s4.JPG)

인증키를 설정해주고,

![k8s5](/images/2023-11-20-setup-kubernetes-in-ncp/k8s5.JPG)

최종 확인을 해주고,

![k8s6](/images/2023-11-20-setup-kubernetes-in-ncp/k8s6.JPG)

생성하기 버튼을 누릅니다.

![k8s7](/images/2023-11-20-setup-kubernetes-in-ncp/k8s7.JPG)

여기까지 하면 쿠버네티스 클러스터가 생성됩니다.

### 2.7 kubectl 서버 세팅
이제 kubectl 서버만 세팅하면 모든 작업이 끝납니다.

#### ACG 생성 및 세팅
네이버는 항상 네트워크 권한 설정할때 ACL을 먼저 생성하는게 좋습니다.

각 서버별로 인바운드 아웃바운드 규칙을 정하기 위함입니다.

![kubectl1](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl1.JPG)

![kubectl2](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl2.JPG)

아웃바운드는 이렇게 하고 인바운드에서는 접속할 ssh 포트에 대한 아이피만 입력해줍니다.

#### 서버 생성
여기 서버는 일반서버 생성과 크게 다르지 않습니다.

서버 이미지를 적당한걸 입력 한 후에 서브넷과 네트워크 설정만 주의해서 만들어 주면 됩니다.

![kubectl3](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl3.JPG)

서버설정을 위에서 설정한 네트워크로 다 설정해준 다음 인증키를 설정해줍니다.

![kubectl4](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl4.JPG)

다음으로 네트워크 설정을 해주시고,

![kubectl5](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl5.JPG)

최종확인을 해주시고,

![kubectl6](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl6.JPG)

서버 생성을 하면 완료 됩니다.

## 3. 설치완료 테스트
모든게 다 설치 되었으면 실제 kubectl 서버로 접속해서 제대로 되는지 확인을 해줍니다.

![kubectl7](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl7.JPG)

kubectl 명령어도 입력해서 노드도 확인해 봅니다.

![kubectl8](/images/2023-11-20-setup-kubernetes-in-ncp/kubectl8.JPG)

여기까지 확인이 되면 네이버클라우드 플랫폼에서의 쿠버네티스 서비스 세팅이 완료되게 됩니다.

## 4. 왜 네이버
여기 까지 설치 하면서 많은 것을 느꼇습니다.

네이버는 구글에 비해서 설정이 지나치게 복잡합니다. 

실제로 구글에서 GKE 를 설정하려면 몇가지 설정만으로 바로 쿠버네티스를 사용할수 있습니다.

클릭 몇번이면 바로 구현됩니다.

### 네이버 좋은점
다만 그럼에도 불구하고 네이버로 구현한 이유는 몇가지가 있습니다.

첫째는 가격입니다. 구글은 구현 난이도가 쉽긴하지만 가격이 어마무시 합니다.

둘째는 한국에서 서비스하는 클라우드 업체라는점입니다. 이건 솔직히 장점인지는 잘 모르겠으나

문제가 생겼을때 한국인이 상담하고 해결할 수 있다는 것입니다.

공부용으로 잠깐 경험해보고 싶으면 구글 크레딧으로 GKE로 테스트 해보는 것을 추천합니다.

PS. 마지막으로 제가 이 자료를 캡처한 시점이 작년이라 보니까 많이 업데이트 된거 같습니다.

NAT Gateway가 조금 달라진거 같은데 이부분은 현재 버전의 문서를 참고하는게 더 좋을거 같습니다.

오늘의 포스팅은 여기까지 입니다.


