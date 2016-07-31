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
            return $site->setSite($this->getConvertion('site', $site->getSite(), 'core')->getPublicName());
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
        if ($entity == 'Ticket' ) {
            return $panneCategory->setTypePanne($this->getConvertion('panneCategory', $panneCategory->getTypePanne(), 'repair')->getName());
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
            $panne->setPanne($this->getConvertion('panne', $panne->getPanne(), 'repair')->getName());
        }
        return null;
    }

    /**
     * @param $panne
     * @param $entity
     * @return mixed|null
     */
    public function ifFilterConvertUtilisateur($panne, $entity)
    {
        if ($entity == 'Ticket') {
            $panne->setPanne($this->getConvertion('panne', $panne->getPanne(), 'repair')->getName());
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
            $this->ifFilterConvertPanne($item, $entity);
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
          if ($entity == 'EtiquetteList' || $entity == 'Ticket') {
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
        $userInfos = $this->get('security.token_storage')->getToken()->getUser();

        return $this->render(explode("\\", $this->newEntity)[0].$this->bundleName.':'.$this->entity.':view.html.twig', array(
            'all'                           => $allItems,
            'fieldsOptions'                 => $this->generateListeChoices(),
            'panel'                         => 'admin',
            'remove_path'                   => 'remove_'.strtolower($this->entity), 
            'alert_text'                    => $this->alertText,
            'is_archived'                   => $isArchived,
            'entity'                        => strtolower($this->checkFormEntity($this->entity)),
            'formAdd'                       => $formAdd->createView(),
            'formEdit'                      => $formEdit->createView(),
            'session_messaging'             => $session_messaging,
            'currentUserInfos'              => $userInfos,
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