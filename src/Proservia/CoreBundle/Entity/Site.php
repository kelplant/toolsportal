<?php
namespace Proservia\CoreBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use DateTime;

/**
 * @ORM\Table(name="edf_site")
 * @ORM\Entity()
 */
class Site
{
    /** @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /** @var string
     * @ORM\Column(name="agence_name", type="string", length=100, nullable=false, unique=true)
     */
    protected $name;

    /** @var string
     * @ORM\Column(type="string", unique=true, length=100, nullable=true)
     */
    protected $shortName;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    protected $adresse;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    protected $codePostal;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    protected $ville;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $contact1;

    /** @var int
     * @ORM\Column(type="integer", nullable=true)
     */
    protected $contact2;

    /** @var string
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    protected $mainPhone;

    /** @var string
     * @ORM\Column(type="text", nullable=true)
     */
    protected $specialComment;

    /** @var string
     * @ORM\Column(type="text", nullable=true)
     */
    protected $rspOrder;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $createdAt;

    /**
     * @var DateTime
     * @ORM\Column(type="datetime", nullable=true)
     */
    protected $updatedAt;

    /**
     * @var string
     * @ORM\Column(type="integer", length=1, nullable=true, options={"default":0})
     */
    protected $isArchived;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     * @return Site
     */
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     * @return Site
     */
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * @return string
     */
    public function getShortName()
    {
        return $this->shortName;
    }

    /**
     * @param string $shortName
     * @return Site
     */
    public function setShortName($shortName)
    {
        $this->shortName = $shortName;
        return $this;
    }

    /**
     * @return string
     */
    public function getAdresse()
    {
        return $this->adresse;
    }

    /**
     * @param string $adresse
     * @return Site
     */
    public function setAdresse($adresse)
    {
        $this->adresse = $adresse;
        return $this;
    }

    /**
     * @return string
     */
    public function getCodePostal()
    {
        return $this->codePostal;
    }

    /**
     * @param string $codePostal
     * @return Site
     */
    public function setCodePostal($codePostal)
    {
        $this->codePostal = $codePostal;
        return $this;
    }

    /**
     * @return string
     */
    public function getVille()
    {
        return $this->ville;
    }

    /**
     * @param string $ville
     * @return Site
     */
    public function setVille($ville)
    {
        $this->ville = $ville;
        return $this;
    }

    /**
     * @return int
     */
    public function getContact1()
    {
        return $this->contact1;
    }

    /**
     * @param int $contact1
     * @return Site
     */
    public function setContact1($contact1)
    {
        $this->contact1 = $contact1;
        return $this;
    }

    /**
     * @return int
     */
    public function getContact2()
    {
        return $this->contact2;
    }

    /**
     * @param int $contact2
     * @return Site
     */
    public function setContact2($contact2)
    {
        $this->contact2 = $contact2;
        return $this;
    }

    /**
     * @return string
     */
    public function getMainPhone()
    {
        return $this->mainPhone;
    }

    /**
     * @param string $mainPhone
     * @return Site
     */
    public function setMainPhone($mainPhone)
    {
        $this->mainPhone = $mainPhone;
        return $this;
    }

    /**
     * @return string
     */
    public function getSpecialComment()
    {
        return $this->specialComment;
    }

    /**
     * @param string $specialComment
     * @return Site
     */
    public function setSpecialComment($specialComment)
    {
        $this->specialComment = $specialComment;
        return $this;
    }

    /**
     * @return string
     */
    public function getRspOrder()
    {
        return $this->rspOrder;
    }

    /**
     * @param string $rspOrder
     * @return Site
     */
    public function setRspOrder($rspOrder)
    {
        $this->rspOrder = $rspOrder;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param DateTime $createdAt
     * @return Site
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * @return DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param DateTime $updatedAt
     * @return Site
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @return string
     */
    public function getIsArchived()
    {
        return $this->isArchived;
    }

    /**
     * @param string $isArchived
     * @return Site
     */
    public function setIsArchived($isArchived)
    {
        $this->isArchived = $isArchived;
        return $this;
    }
}