<?php
namespace AppBundle\Services\Core;

class IndexControllerService extends AbstractControllerService
{
    /**
     * @param $site
     * @param $entity
     * @return null
     */
    public function ifFilterConvertSite($site, $entity)
    {
        if ($entity == 'ScreenOrder' || $entity == 'BureautiqueOrder' || $entity == 'SpecifiqueOrder' || $entity == 'Ticket') {
            return $site->setSite($this->getConvertion('site', $site->getSite(), 'core')->getShortName());
        }
        return null;
    }

    /**
     * @param $panneCategory
     * @param $entity
     * @return mixed|null
     */
    public function ifFilterConvertPanneCategorie($panneCategory, $entity)
    {
        if ($entity == 'Panne' ) {
           return $panneCategory->setCategory($this->getConvertion('panneCategory', $panneCategory->getCategory(), 'repair')->getName());
        }
        return null;
    }

    /**
     * @param $panne
     * @param $entity
     * @return mixed|null
     */
    public function ifFilterConvertPanne($panne, $entity)
    {
        if ($entity == 'Ticket') {
            $panne->setPanne($this->getConvertion('panne', $panne->getAgence(), 'repair')->getName());
        }
        return null;
    }

    /**
     * @param $product
     * @param $entity
     * @return mixed|null
     */
    public function ifFilterConvertProduct($product, $entity)
    {
        if ($entity == 'EtiquetteList' || $entity == 'Ticket') {
            $productToLook = $this->getConvertion('product', $product->getProduct(), 'core');
            if ($productToLook != null) {
                $product->setProduct($productToLook->getName());
            }
        }
        return null;
    }

    /**
     * @param $entity
     * @param $allItems
     * @return mixed
     */
    private function getListOfItems($entity, $allItems)
    {
        foreach ($allItems as $item) {
            $this->ifFilterConvertSite($item, $entity);
            $this->ifFilterConvertPanneCategorie($item, $entity);
            $this->ifFilterConvertProduct($item, $entity);
            //$this->ifFilterConvertAgence($item, $entity);
        }
        return $allItems;
    }

    /**
     * @param $entity
     * @param $isArchived
     * @return mixed
     */
    private function ifCandidatOUtilisateurList($entity, $isArchived)
    {
        if ($entity == 'Candidat' || $entity == 'Utilisateur') {
            return $this->get($this->servicePrefix.'.'.strtolower($this->entity).'_manager')->getlist($isArchived);
        } else {
            return $this->getListOfItems($this->entity, $this->get($this->servicePrefix.'.'.strtolower($this->entity).'_manager')->getRepository()->findAll());
        }
    }

    /**
     * @param $message_errorCode
     * @param $globalAlertColor
     * @return string
     */
    private function returnGoodcolor($message_errorCode, $globalAlertColor)
    {
        if ($message_errorCode == 0 && $globalAlertColor == 0) {
            return 'success';
        } else {
            return 'danger';
        }
    }

    /**
     * @param $session_messaging
     * @return string
     */
    public function getGlobalAlertColor($session_messaging)
    {
        $globalAlertColor = 0;
        if (isset($session_messaging)) {
            foreach ($session_messaging as $message) {
                $globalAlertColor = $this->returnGoodcolor($message['errorCode'], $globalAlertColor);
            }
            return $globalAlertColor;
        } else {
            return '';
        }
    }

    /**
     * @param $checkDate
     * @return string
     */
    public function colorForCandidatSlider($checkDate)
    {
        if (date("Y-m-d", time() + 604800) < $checkDate)
        {
            return 'green';
        } else {
            return 'red';
        }
    }

    /**
     * @param $isArchived
     * @param $formAdd
     * @param $formEdit
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getFullList($isArchived, $formAdd, $formEdit)
    {
        $allItems = $this->ifCandidatOUtilisateurList($this->entity, $isArchived);
        $session_messaging = $this->get('session')->get('messaging');
        $this->get('session')->set('messaging', []);
        $globalAlertColor = $this->getGlobalAlertColor($session_messaging);
        //$candidatListe = $this->get('core.candidat_manager')->getRepository()->findBy(array('isArchived' => '0'), array('startDate' => 'ASC'));
        $userInfos = $this->get('security.token_storage')->getToken()->getUser();
        //$myProfil = $this->get('core.utilisateur_manager')->load($this->get('ad.active_directory_user_link_manager')->getRepository()->findOneByIdentifiant($userInfos->getUsername())->getUser());

        return $this->render(explode("\\", $this->newEntity)[0].$this->bundleName.':'.$this->entity.':view.html.twig', array(
            'all'                           => $allItems,
            'fieldsOptions'                 => $this->generateListeChoices(),
            'panel'                         => 'admin',
            //'utilisateursList'              => $this->get("core.utilisateur_manager")->createListForSelect(),
            'remove_path'                   => 'remove_'.strtolower($this->entity), 
            'alert_text'                    => $this->alertText,
            'is_archived'                   => $isArchived,
            'entity'                        => strtolower($this->checkFormEntity($this->entity)),
            //'nb_candidat'                   => count($candidatListe),
            //'candidat_color'                => $this->colorForCandidatSlider($candidatListe[0]->getStartDate()->format("Y-m-d")),
            'formAdd'                       => $formAdd->createView(),
            'formEdit'  => $formEdit->createView(),
            'session_messaging' => $session_messaging,
            'currentUserInfos'              => $userInfos,
            //'userPhoto'                     => $this->get('google.google_user_api_service')->base64safeToBase64(stream_get_contents($userInfos->getPhoto())),
            'globalAlertColor'              => $globalAlertColor,
            'remaining_gmail_licenses'      => $this->get('app.parameters_calls')->getParam('remaining_google_licenses'),
            'remaining_salesforce_licenses' => $this->get('app.parameters_calls')->getParam('remaining_licences_type_Salesforce'),
        ));
    }

    /**
     * @param $isArchived
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateIndexAction($isArchived)
    {
        $this->initBothForms();

        return $this->getFullList($isArchived, $this->formAdd, $this->formEdit);
    }
}