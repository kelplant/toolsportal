<?php
namespace AppBundle\Services\Core;

/**
 * Class DeleteControllerService
 * @package CoreBundle\Services\Core
 */
class DeleteControllerService extends AbstractControllerService
{
    protected $remove;

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateDeleteAction()
    {
        $this->initBothForms();
        return $this->get('core.index.controller_service')->getFullList($this->isArchived, $this->formAdd, $this->formEdit);
    }
}